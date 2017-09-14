const Event = require('events');
const http = require('http');
const Router = require('./server/router');

class Ctx{
    constructor (req,res){
        let that=this;
        this.yuri2 = require('../yuri2');
        this.$req=req;
        this.$res=res;
        this.req={
            id: this.yuri2.uuid()
        };
        this.res={
            _stateCode: 200,
            _headers: {
                'Content-Type': 'text/html;charset=utf8'
            },
            _bodyBuffers: [],
            setState: function (stateCode) {
                this._stateCode = stateCode;
            },
            setHeader: function (header, content) {
                this._headers[header] = content;
            },
            send: function (...data) {
                if (!Buffer.isBuffer(data)) {
                    data = new Buffer(...data);
                }
                this._bodyBuffers.push(data);
            }
        };
    }
    dump(data){
        this.res.send(this.yuri2.inspect(data,true));
    }
}

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
    }
};