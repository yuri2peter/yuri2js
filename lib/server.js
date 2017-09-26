const Event = require('events');
const http = require('http');
const Router = require('./server/router');
const Ctx = require('./server/ctx');


class Yuri2Server extends Event {
    constructor(data) {
        super();
        const yuri2 = require('../yuri2');
        this.data={
            name:'app',
            debug:false,
        };
        this.data=require('../yuri2').jsonMerge(this.data,data);
        if(!this.data.dirApp){
            this.data.dirApp='./'+this.data.name;
            yuri2.yuri2File.mkdir(this.data.dirApp);
        }//创建主目录}
        //创建app系列目录
        yuri2.yuri2File.mkdir('./'+this.data.dirApp+'/routes');
        yuri2.yuri2File.mkdir('./'+this.data.dirApp+'/runtime');
        yuri2.yuri2File.mkdir('./'+this.data.dirApp+'/public');
        yuri2.yuri2File.mkdir('./'+this.data.dirApp+'/views');
        yuri2.yuri2File.mkdir('./'+this.data.dirApp+'/models');
        yuri2.yuri2File.mkdir('./'+this.data.dirApp+'/temp');

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
                !ctx.data.debug||console.log(e);
                ctx.emit('error');
            });
            ctx.emit('end');
        }).listen(port);
        this.serverPort = port;
        console.log('Server is running on http://localhost:' + port);
    }

    stop() {
        if (this.server) {
            this.server.close();
            console.log(`The server on ${this.serverPort} was closed.`);
        }
        this.emit('stop');
    }
}


module.exports = {
    createServer(...params) {
        return new Yuri2Server(...params);
    },
    createRouter(...params) {
        return new Router(...params);
    },
    getMiddleware(name){
        return require('./server/'+name);
    }
};