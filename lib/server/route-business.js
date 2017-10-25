const yuri2 = require('../../yuri2');

module.exports = function (router,options) {
    options=yuri2.jsonMerge({
        dir:'./business',
    },options);
    if(!yuri2.yuri2File.isDir(options.dir)){
        throw new Error('route-business:main dir is not exist(set {dir:"your dir for business"}).')
    }
    router.all(/./,async function (ctx) {
        let file=options.dir+ctx.req.pathname+'.js';
        if(!yuri2.yuri2File.isSubDir(file,options.dir)){return false;} //如果路径不是子目录下无效，防止../非法访问
        let handle;
        try {
            if(ctx.isEnable('debug')){
                handle=yuri2.requireWithoutCache(file);
            }else{
                handle=require(file);
            }
        }catch(e) {
            return false;
        }
        if(typeof handle === 'function')
            await handle(ctx);
        else
            return false;
    });
    return false;
};