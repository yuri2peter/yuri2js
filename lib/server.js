const Event = require('events');
const http = require('http');
const Router = require('./server/router');
const Ctx = require('./server/ctx');
const Path=require('path');


class Yuri2Server extends Event {
    constructor(data) {
        super();
        const yuri2 = require('../yuri2');
        this.data={
            name:'app',
            debug:false,
        };
        this.data=require('../yuri2').jsonMerge(this.data,data);
        if(!this.data.dir){
            this.data.dir=Path.resolve('./'+this.data.name);
            yuri2.yuri2File.mkdir(this.data.dir);
        }//创建主目录}
        //创建app系列目录
        yuri2.yuri2File.mkdir(this.data.dir+'/routes');
        yuri2.yuri2File.mkdir(this.data.dir+'/runtime');
        yuri2.yuri2File.mkdir(this.data.dir+'/public');
        yuri2.yuri2File.mkdir(this.data.dir+'/views');
        yuri2.yuri2File.mkdir(this.data.dir+'/models');
        yuri2.yuri2File.mkdir(this.data.dir+'/temp');

        this.middlewares = []; //中间件数组
        this.server = null;
        this.serverPort = null;
        this.state={
            startTime:null,
            runningState:'ready'
        }
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    listen(port) {
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
                    ctx.$res.writeHead(ctx.res._stateCode, ctx.res._headers);
                    ctx.$res.end(Buffer.concat(ctx.res._bodyBuffers)); //未结束响应则立即结束
                }
            }).catch(function (e) {
                !ctx.data.debug||ctx.dump(e,true);
                if (!ctx.$res.finished) {
                    ctx.$res.writeHead(500, ctx.$res._headers);
                    ctx.$res.end(Buffer.concat(ctx.res._bodyBuffers)); //未结束响应则立即结束
                }
                !ctx.isEnable('debug')||console.log(e);
                ctx.server.emit('error',e);
            });
            ctx.emit('end');
        }).listen(port);
        this.serverPort = port;
        console.log(`Server ${this.data.name} is running on http://localhost:${port}`);

        process.on('exit',function () {
            that.stop();
        })
    }

    stop() {
        if (this.server) {
            this.server.close();
            this.emit('close');
            console.log(`The server on ${this.serverPort} was closed.`);
        }
    }
}


module.exports = {
    create(...params) {
        return new Yuri2Server(...params);
    },
    getMiddleware(name){
        return require('./server/'+name);
    }
};