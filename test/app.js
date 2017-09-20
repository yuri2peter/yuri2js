const log = console.log;

const yuri2 = require('../yuri2');

let app = yuri2.yuri2Server.createServer();
let router = yuri2.yuri2Server.createRouter();
// app.use(yuri2.yuri2Server.getMiddleware('./server/spirit'));
require('./route_table')(router);
app.use(router.parse());
app.use(async function (ctx,next) {
    let path=ctx.req.pathname;
    let filepath='./public'+path;
    if(yuri2.yuri2File.isFile(filepath)){
        let Static=yuri2.yuri2Server.getMiddleware('static');
        let static=new Static(ctx);
        static.response(filepath);
    }else{
        await next();
    }
});
app.use(router.route());
app.listen(8080);
