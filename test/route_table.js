//动态加载路由表
const yuri2=require('../yuri2');
module.exports=function (router) {
    router.get('/',async function (ctx,next) {
        ctx.dump(yuri2.yuri2Format.jsonToQuery(ctx.req.gets));
        ctx.res.send(`
            <!--<script src="https://cdn.bootcss.com/jquery/2.2.4/jquery.min.js"></script>-->
            <form action="./" method="post" enctype="multipart/form-data">
                <input name="f" type="file" multiple>
                <input name="a" value="a1">
                <input type="submit">
            </form>
        `);
        console.log(a.b);
        await next();
    });
    router.post('/',async function (ctx,next) {
        let rel=await ctx.bodyParse({type:'multipart',maxsize:1024*1024});
        ctx.dump(rel.result.files.f);
        await next();
    });
};