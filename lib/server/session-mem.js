//基于内存的session
const yuri2 = require('../../yuri2');

let sessionData = {}; //内存型session数据池
class Session {
    constructor(ctx, options) {
        this._loaded = false;
        this.ctx = ctx;
        this.data = undefined;
        this.options = options;
        this.pool = sessionData[this.ctx.app.data.name]; //pool是按name索引的全局存储
        this.id = ctx.req.cookies[this._getIdName()];//从cookie获取id
        if (!this.id) {
            this.changeID(); //新id
        }
        ctx.session = this;
    }

    _getIdName() {
        return this.options.name + '_' + this.ctx.app.data.name;
    }

    getID() {
        return this.id;
    }

    async load() {
        //尝试内存读取id
        await yuri2.yuri2Lock.lock(this.id);
        let session = this.pool[this.id]; //按id取数据
        if (session && session.ip === this.ctx.req.ip) {
            //有
            this.data = session.data;//数据赋值到对象
            session.visit = yuri2.timestamp();//刷新访问时间
        } else {
            //木有
            this.pool[this.id] = { //新建数据
                data: {},
                visit: yuri2.timestamp(),
                ip: this.ctx.req.ip,
            };
            this.data = {};//数据赋值到对象
        }
        this._loaded=true;
        return this.data;
    }
    //改变id号
    changeID(id = yuri2.uuid()) {
        yuri2.yuri2Lock.unlock(this.id); //解锁
        this.data = {};
        this.id = id;
        this.ctx.res.setCookie(this._getIdName(), this.id, {});
    }

    save() {
        if (!this._loaded) {
            return;
        }
        this.pool[this.id] = {
            data: this.data,
            visit: yuri2.timestamp(),
            ip: this.ctx.req.ip,
        };
        yuri2.yuri2Lock.unlock(this.id); //解锁
    }

    //过期回收
    static gc(interval = 300000) {
        setInterval(function () {
            let timeNow = yuri2.timestamp();
            for (let i in this.pool) {
                let session = this.pool[i];
                if (session.visit + this.options.timeout < timeNow) {
                    //过期清理
                    delete this.pool[i];
                }
            }
        }, interval);
    }

    //初始化，读取文件
    static init(app) {
        let file = app.data.dirRuntime + '/session-mem/' + app.data.name + '.json'; //session文件位置
        let data = yuri2.yuri2File.fileGetContent(file);//读取文件
        sessionData[app.data.name] = data ? JSON.parse(data) : {};//初始化对应session池
    }

    //注册关闭事件，保存session到本地
    static onCLose(app) {
        app.on('close', function () {
            let file = app.data.dirRuntime + '/session-mem/' + app.data.name + '.json'; //session文件位置
            let len = yuri2.yuri2File.filePutContent(file, JSON.stringify(sessionData[app.data.name]));
            console.log(`Session file saved(${len}).`);
        });
    }

}

module.exports = function (options) {
    let app=options.app;
    Session.init(app);
    Session.onCLose(app);
    Session.gc(300000);//300秒一次gc
    options = yuri2.jsonMerge({
        name: 'yuri2-js-session-id',
        timeout: 600,
        lock: true,
    }, options);

    return async function (ctx, next) {
        let s = new Session(ctx, options);
        await next();
        s.save();
    };
};