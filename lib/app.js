const Event = require('events');
const http = require('http');
const Router = require('./server/router');
const Ctx = require('./server/ctx');
const Path=require('path');


class Yuri2App extends Event {
    constructor(data) {
        super();
        this.yuri2 = require('../yuri2');
        this.data={
            name:'app',
            debug:false,
            port:80,
            autoRelease:false,
            tpl:'ejs',//默认模板引擎
        };
        this.data=require('../yuri2').jsonMerge(this.data,data);
        if(!this.data.dir) throw new Error('Main dir for app is required.');
        if(!this.data.dirRuntime) this.data.dirRuntime=this.data.dir+'/runtime';
        if(!this.data.dirTemp) this.data.dirTemp=this.data.dir+'/temp';
        if(!this.data.dirViews) this.data.dirViews=this.data.dir+'/views';

        this.middlewares = []; //中间件数组
        this.server = null;
        this.serverPort = this.data.port;
        this.state={
            startTime:null,
            runningState:'ready'
        };
        this.md=this.yuri2.yuri2App.getMiddleware;
    }

    use(middleware,options={}) {
        let that=this;
        if( typeof middleware === 'string'){
            middleware=this.yuri2.yuri2App.getMiddleware(middleware);
            if(typeof middleware === 'function')
                middleware=middleware(this.yuri2.jsonMerge(options,{app:that}));
        }
        if (typeof middleware === 'function')
            this.middlewares.push(middleware);
    }

    listen() {
        if(this.state.runningState!=='ready'){return false;} //ready?
        this.state.runningState='running';
        this.state.startTime=new Date();
        const yuri2 = require('../yuri2');
        const that = this;
        let fn = yuri2.compose(this.middlewares);
        this.server = http.createServer(async (req, res) => {
            let ctx = new Ctx(req, res,that);
            await fn(ctx).then(function () {
                if (!ctx.$res.finished) {
                    ctx.$res.headersSent||ctx.$res.writeHead(ctx.res._stateCode, ctx.res._headers);
                    ctx.$res.end(Buffer.concat(ctx.res._bodyBuffers)); //未结束响应则立即结束
                }
            }).catch(function (e) {
                !ctx.data.debug||ctx.dump(e,true);
                if (!ctx.$res.finished) {
                    ctx.$res.headersSent||ctx.$res.writeHead(500, ctx.$res._headers);
                    ctx.$res.end(Buffer.concat(ctx.res._bodyBuffers)); //未结束响应则立即结束
                }
                !ctx.isEnable('debug')||console.log(e);
                ctx.app.emit('error',e);
            });
            ctx.emit('end');
        }).listen(that.data.port);
        this.server.on('listening',function () {
            console.log(`Server ${that.data.name} is running on http://localhost:${that.data.port}`);
            that.emit('start');
        });
        this.server.on('error',function (err) {
            if (err.code === 'EADDRINUSE') { // 端口已经被使用
                console.log('The port[' + that.data.port + '] is occupied, please change other port.');
                that.stop();
            }else{
                console.log(err)
            }
        });
        process.on('exit',function () {
            that.stop();
        });

        !this.data.autoRelease||that.autoRelease();
    }

    stop() {
        if (this.server) {
            this.server.close();
            this.emit('close');
            console.log(`The server on ${this.serverPort} was closed.`);
        }
    }

    //防止程序意外错误却不释放端口，可以简单的通过删除runtime下的文件running.lock来解决
    autoRelease(){
        const that=this;
        const file=this.data.dirRuntime+"/running.lock";
        this.yuri2.yuri2File.filePutContent(file,`
# yuri2js web app
# delete this file to stop the app
        
STIME:${this.yuri2.yuri2Format.dateFormat()}
APP:${this.data.name}
PORT:${this.data.port}
PID:${process.pid}`);

        const isFile=this.yuri2.yuri2File.isFile;
        setInterval(function () {
            try {
                if(!isFile(file)){
                    process.exit(128)
                }
            }catch (e){}
        },3000)
    }
}


module.exports = {
    //创建标准web项目结构
    build(name,path){
        this.getMiddleware('project-builder')(name,path);
    },
    create(...params) {
        return new Yuri2App(...params);
    },
    getMiddleware(name){
        return require('./server/'+name);
    }
};