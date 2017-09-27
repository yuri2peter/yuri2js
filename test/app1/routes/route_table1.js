//动态加载路由表
const yuri2=require('../../../yuri2');
module.exports=function (router) {
    router.get('/test1',async function (ctx,next) {
        a.b
        await next();
    });
};