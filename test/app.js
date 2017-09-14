const log = console.log;

const yuri2 = require('../yuri2');

let app = yuri2.yuri2Server.createServer();
app.use(async function (ctx, next) {
    let router = yuri2.yuri2Server.createRouter(ctx);
    router.route();
    await next();
});
app.use(async function (ctx, next) {
    ctx.dump(yuri2.yuri2Format.urldecode('%E4%BD%A0%E5%A5%BD'));
    ctx.res.send('hello world');
    await next();
});
app.listen(8080);
