const fs = require("fs");
const Path = require("path");
const yuri2=require('../../yuri2');

class Static{
    constructor(ctx){
        this.ctx=ctx;
    }
    response (path,maxAge=86400){
        let data=this.ctx.yuri2.yuri2File.fileGetContent(path);
        if(data){
            let ext=Path.extname(path);
            this.ctx.res.setHeader('Content-Type',yuri2.getContentTypeByExt(ext));
            this.ctx.res.setHeader('Cache-control','max-age='+maxAge);
            this.ctx.res.send(data);
        }else{
            this.ctx.res.setState(404);
        }
    }
}

module.exports=function (router,options) {
    options=yuri2.jsonMerge({
        dir:'./static',
        maxAge:86400,
    },options);
    if(!yuri2.yuri2File.isDir(options.dir)){
        throw new Error('route-business:main dir is not exist(set {dir:"your dir for business"}).')
    }

    router.get(/./,async function (ctx) {
        let file=options.dir+ctx.req.pathname;
        if(yuri2.yuri2File.isSubDir(file,options.dir)&&yuri2.yuri2File.isFile(file)){
            let staticResponse=new Static(ctx,options.maxAge);
            staticResponse.response(file);
        }else if(ctx.req.pathname==='/favicon.ico'){
            ctx.res.setHeader('Content-Type',"image/x-icon");
            ctx.res.setHeader('Cache-control','max-age=3600');
            let ico=new Buffer("AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPf39xT19fVk/v/3FgAAAAAAAAAAAAAAAPv890D7/fRW9fT0KAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD7/PcO2NDp7cK13b/9//Vg+/z4Ev3/+E719/HntqbZ+erm8FoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANrS7LlEDsD/dlLJ/9PL4vm/stz/XzPE/1ssx//09PMqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADu7PByWy3H/0UOw/9IE8H/RxHC/0ILwv9+WtDn/P71BgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P7zOm9Hy/9IEsP/TRnE/00ZxP9EDML/mX7V0wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P/zFrSj2NVMGcL/TBjE/00ZxP9NGcT/SxbE/1kqw//SzOGpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8fHrJKGL0eE/CMD/SBLD/00YxP9NGcT/TRnE/0wYxP9EDsL/ShbA/8K227/y8u0QAAAAAAAAAAAAAAAAAAAAAOLe5W6Yfdbrgl7T+WxBzf9PHMX/TBjE/0sWw/9WJMb9cknP3YRh0rmnktiX7u7rMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//+Q7///oqq5Te6UMMwf9JFMP/0sjoSgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPHv9D5MGMT1d1HOvwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWirHclcmx0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM2/7RLCseoIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AADjjwAA4A8AAPAPAADwDwAA8B8AAOAPAADAAwAAwAMAAPA/AAD8fwAA/n8AAP5/AAD//wAA//8AAA==",'base64');
            ctx.res.send(ico);
        }else{
            return false;
        }

    });
    return false;
};