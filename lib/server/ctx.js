const Event =require('events');
module.exports=class Ctx extends Event{
    constructor (req,res,server){
        super();
        let that=this;
        const yuri2=  require('../../yuri2');
        this.yuri2 = yuri2;
        this.data=yuri2.jsonMerge({},server.data); //配置表
        this.server=server;
        this.dir=server.data.dir;
        this.$req=req;
        this.$res=res;
        this.isEnable=function (name) {return this.data[name]===true };
        this.enable=function (name) {this.data[name]=true;  };
        this.disable=function (name) {this.data[name]=false;  };
        this.req={
            ctx:this,
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
            ctx:this,
            _stateCode: 200,
            _headers: [
                ['Content-Type', 'text/html;charset=utf8']
            ],
            _bodyBuffers: [],
            setState: function (stateCode) {
                this._stateCode = stateCode;
            },
            setHeader: function (header, content,overwrite=true) {
                if(overwrite){
                    for (let i in this._headers){
                        if(this._headers[i][0]===header){
                            this._headers[i]=['pre-'+this._headers[i][0],this._headers[i][1]];
                        }
                    }
                }
                this._headers.push([header,content])
            },
            send: function (data) {
                if(that.yuri2.isJson(data)){
                    data=JSON.stringify(data);
                }
                if (!Buffer.isBuffer(data)) {
                    data = new Buffer(data);
                }
                this._bodyBuffers.push(data);
            },
            redirect(url,code=302){
                this.setState(code);
                this.setHeader('location',url)
            }
        };
    }
    dump(data){
        this.res.send(this.yuri2.inspect(data,true));
    }

    //解析body数据
    async bodyParse(options={}){
        let BodyParser=require('./body-parser');
        let parser=new BodyParser(this);
        return await parser.parse(options);
    }
};
