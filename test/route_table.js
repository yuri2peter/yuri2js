//动态加载路由表
const yuri2=require('../yuri2');
module.exports=function (router) {
    router.get('/',async function (ctx,next) {
        ctx.res.send(`
            <form action="./" method="post">
                <input name="a" value="A">
                <input type="submit">
            </form>
        `);
        await next();
    });
    router.post('/',async function (ctx,next) {
        let req=ctx.$req;
        // 定义了一个post变量，用于暂存请求体的信息
        let post = [];
        let wait=new yuri2.yuri2WaitMe();
        req.on('data', function(chunk){
            post.push(chunk);
        });

        // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
        req.on('end', function(){
            post = Buffer.concat(post);
            ctx.res.send(post);
            wait.done();
        });
        await wait.wait();
        ctx.res.send(`posted`);
        await next();
    });
};