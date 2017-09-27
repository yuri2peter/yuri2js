const yuri2 = require('../yuri2');

let app = yuri2.yuri2Server.create({
    name:'app1',
    debug:true,
});
let router = yuri2.yuri2Server.getMiddleware('router')(app);//路由
app.use(yuri2.yuri2Server.getMiddleware('spirit')());//右下角时间提示
app.use(yuri2.yuri2Server.getMiddleware('logger')(app));//日志
app.use(yuri2.yuri2Server.getMiddleware('not-found')({msg:['天啊，那页失踪了','返回首页'], home:'/'}));//404提示
app.use(yuri2.yuri2Server.getMiddleware('cookie-session')(app));
app.use(yuri2.yuri2Server.getMiddleware('pug-support')());//pug模板引擎支持
app.use(yuri2.yuri2Server.getMiddleware('state-control')(app));//状态控制
app.use(router.parse());//解析路由
app.use(yuri2.yuri2Server.getMiddleware('static')('./public'));
app.use(router.route());//引导路由
app.listen(8080);