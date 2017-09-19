module.exports=class Ctx{
    constructor (req,res){
        let that=this;
        this.yuri2 = require('../../yuri2');
        this.$req=req;
        this.$res=res;
        this.req={
            id: this.yuri2.uuid(),
            headers:req.headers,
            url:req.url,
            method:req.method,
            ip: req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress,
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
};