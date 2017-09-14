let url = require("url");
let querystring  = require("querystring");
module.exports=class {
    constructor(ctx){
        this.ctx=ctx
    }
    route(){
        let ctx=this.ctx;
        let _url=ctx.$req.url;
        let urlParsed=url.parse(_url);
        let gets=querystring.parse(urlParsed.query);
        ctx.req.pathname=urlParsed.pathname;
        ctx.req.query=urlParsed.query;
        ctx.req.gets=gets;
    }
};