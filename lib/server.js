const Event = require('events');
const http = require('http');
const Router = require('./server/router');
const Ctx = require('./server/ctx');


class Yuri2Server extends Event {
    constructor() {
        super();
        this.middlewares = []; //中间件数组
        this.server = null;
        this.serverPort = null;
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    listen(port) {
        const yuri2 = require('../yuri2');
        let fn = yuri2.compose(this.middlewares);
        this.server = http.createServer((req, res) => {
            let ctx = new Ctx(req, res);
            fn(ctx).then(function () {
                if (!ctx.$res.finished) {
                    ctx.$res.writeHead(200, ctx.res._headers);
                    ctx.$res.end(Buffer.concat(ctx.res._bodyBuffers)); //未结束响应则立即结束
                }
            }).catch(function (e) {
                if (!ctx.$res.finished) {
                    ctx.$res.writeHead(500, ctx.$res._headers);
                    ctx.dump(e,true);
                    ctx.$res.end(Buffer.concat(ctx.res._bodyBuffers)); //未结束响应则立即结束
                }
                console.log(e)
            })
        }).listen(port);
        this.serverPort = port;
        console.log('Server is running on http://localhost:' + port);
    }

    stop() {
        if (this.server) {
            this.server.close();
            console.log(`The server on ${this.serverPort} was closed.`);
        }
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