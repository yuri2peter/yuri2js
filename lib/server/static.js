const fs = require("fs");
const Path = require("path");

class Static{
    constructor(ctx){
        this.ctx=ctx;
    }
    static getContentTypeByExt(ext){
        let map=require('../map-mime');
        if(ext===''){ext='.*'}
        if(ext.substr(0, 1)!=='.'){
            ext='.'+ext;
        }
        if(!map[ext]){
            ext='.*';
        }
        return map[ext];
    }
    response (path,maxAge=86400){
        let data=this.ctx.yuri2.yuri2File.fileGetContent(path);
        if(data){
            let ext=Path.extname(path);
            this.ctx.res.setHeader('Content-Type',Static.getContentTypeByExt(ext));
            this.ctx.res.setHeader('Cache-control','max-age='+maxAge);
            this.ctx.res.send(data);
        }else{
            this.ctx.res.setState(404);
        }
    }
}

module.exports=function (prefix='./static',maxAge=86400) {
    return async function (ctx,next) {
        const yuri2=require('../../yuri2');
        let path=ctx.req.pathname.replace('..','');
        let filePath=prefix+path;
        if(yuri2.yuri2File.isFile(filePath)){
            let staticResponse=new Static(ctx,maxAge);
            staticResponse.response(filePath);
            ctx.disable('spirit') //关闭spirit
        }else if(path==='/favicon.ico'){
            //屏蔽图标请求
            ctx.res.setHeader('Content-Type',"image/x-icon");
            ctx.res.setHeader('Cache-control','max-age=3600');
            ctx.disable('spirit') //关闭spirit
        }else{
            await next();
        }
    }
};