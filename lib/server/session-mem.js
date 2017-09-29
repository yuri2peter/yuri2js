//基于内存的session
const yuri2=require('../../yuri2');

let sessionData = {}; //内存型session数据池
class Session {
    constructor(ctx,options) {
        this.ctx = ctx;
        this.options = options;
        this.pool = sessionData[this.ctx.server.data.name];
        this.id = ctx.req.cookies[this._getIdName()];
        if (!this.id) {
            let id = yuri2.uuid();
            this.id = id;
            this.ctx.res.setCookie(this._getIdName(), id, {});
        }
    }

    _getIdName() {
        return this.options.name + '_' + this.ctx.server.data.name;
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

    //过期回收
    static gc(chance = 0.01) {
        let timeNow = yuri2.timestamp();
        if (Math.random() < chance) {
            for (let i in this.pool) {
                let session = this.pool[i];
                if (session.visit + this.options.timeout < timeNow) {
                    //过期清理
                    delete this.pool[i];
                }
            }
        }
    }

    //初始化，读取文件
    static init(server){
        let file=server.data.dir+'/runtime/session/'+server.data.name+'.json'; //session文件位置
        let data=yuri2.yuri2File.fileGetContent(file);//读取文件
        sessionData[server.data.name]=data?JSON.parse(data):{};//初始化对应session池
    }

    //注册关闭事件，保存session到本地
    static onCLose(server){
        server.on('close', function () {
            let file=server.data.dir+'/runtime/session/'+server.data.name+'.json'; //session文件位置
            let len=yuri2.yuri2File.filePutContent(file,JSON.stringify(sessionData[server.data.name]));
            console.log(`Session file saved(${len}).`);
        });
    }

}

module.exports = function (server,options) {
    Session.init(server);
    Session.onCLose(server);
    options=yuri2.jsonMerge({
        name : 'yuri2-js-session-id',
        timeout : 600,
    },options);

    return async function (ctx, next) {
        Session.gc();
        let s = new Session(ctx,options);
        s.load();
        await next();
        s.save();
    };
};