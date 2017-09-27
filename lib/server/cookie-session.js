const cookie = require('cookie');
const yuri2 = require('../../yuri2');
const session_id_name = 'yuri2-js-session-id';
const session_timeout = 600;//session过期时间 默认600秒

class Cookie {
    constructor(ctx) {
        this.ctx = ctx;
    }

    parse() {
        return cookie.parse(this.ctx.$req.headers.cookie || '');
    }

    serialize(name, value, options = 3 * 30 * 24 * 3600) {
        if (!isNaN(options)) {
            options = {maxAge: options}
        }
        if (yuri2.isJson(value)) {
            value = JSON.stringify(value)
        }
        let str = cookie.serialize(name, String(value), options);
        this.ctx.res.setHeader('Set-Cookie', str, false);
    }
}

let sessionData = {};

class Session {
    constructor(ctx) {
        this.ctx = ctx;
        this.pool = sessionData[this.ctx.server.data.name];
        this.id = ctx.req.cookies[this._getIdName()];
        if (!this.id) {
            let id = yuri2.uuid();
            this.id = id;
            this.ctx.res.setCookie(this._getIdName(), id, {});
        }
    }

    _getIdName() {
        return session_id_name + '_' + this.ctx.server.data.name;
    }

    load() {
        //尝试内存读取id
        let session = this.pool[this.id];
        if (session) {
            //有
            this.ctx.session = session.data;//读取数据
            session.visit = yuri2.timestamp();//刷新访问时间
        } else {
            //木有
            this.pool[this.id] = {
                data: {},
                visit: yuri2.timestamp()
            };
            this.ctx.session = {};
        }
    }

    save() {
        this.pool[this.id] = {
            data: this.ctx.session,
            visit: yuri2.timestamp()
        };
    }

    static gc(chance = 0.01) {
        let timeNow = yuri2.timestamp();
        if (Math.random() < chance) {
            for (let i in this.pool) {
                let session = this.pool[i];
                if (session.visit + session_timeout < timeNow) {
                    //过期清理
                    delete this.pool[i];
                }
            }
        }
    }
}

module.exports = function (server) {
    let file=server.data.dir+'/runtime/session/'+server.data.name+'.json'; //session文件位置
    let data=yuri2.yuri2File.fileGetContent(file);//读取文件
    let pool=sessionData[server.data.name]=data?JSON.parse(data):{};//初始化对应session池
    //注册关闭事件，保存session到本地
    server.on('close', function () {
        let len=yuri2.yuri2File.filePutContent(file,JSON.stringify(pool));
        console.log(`Session file saved(${len}).`);
    });
    return async function (ctx, next) {
        Session.gc();
        let c = new Cookie(ctx);
        ctx.req.cookies = c.parse();
        ctx.res.setCookie = function (name, value, options = 3 * 30 * 24 * 3600) {
            c.serialize(name, value, options);
        };

        let s = new Session(ctx);
        ctx.req.sessions = s.load();
        await next();
        ctx.req.sessions = s.save();
    };
};