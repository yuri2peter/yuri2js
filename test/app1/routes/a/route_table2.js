//动态加载路由表
const yuri2=require('../../../../yuri2');
module.exports=function (router) {
    router.get('/test2',async function (ctx,next) {
        ctx.dump(2);
        await next();
    });
};