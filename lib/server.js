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
            port:80,
        };
        this.data=require('../yuri2').jsonMerge(this.data,data);

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
        }).listen(that.data.port);
        this.server.on('listening',function () {
            console.log(`Server ${that.data.name} is running on http://localhost:${that.data.port}`);
            that.emit('start');
        });
        this.server.on('error',function (err) {
            if (err.code === 'EADDRINUSE') { // 端口已经被使用
                console.log('The port[' + that.data.port + '] is occupied, please change other port.')
            }else{
                console.log(err)
            }
        });
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
    //创建标准web项目结构
    build(name,path){
        this.getMiddleware('project-builder')(name,path);
    },
    create(...params) {
        return new Yuri2Server(...params);
    },
    getMiddleware(name){
        return require('./server/'+name);
    }
};