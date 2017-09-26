const log = console.log;

const yuri2 = require('../yuri2');

let app = yuri2.yuri2Server.createServer({
    name:'app1',
    debug:true,
});
let router = yuri2.yuri2Server.createRouter();
router.load(__dirname+'/app/routes');
app.use(yuri2.yuri2Server.getMiddleware('spirit')());
app.use(yuri2.yuri2Server.getMiddleware('not-found')({msg:['天啊，那页失踪了','返回首页'], home:'/'}));
app.use(yuri2.yuri2Server.getMiddleware('cookie-session')(app));
app.use(yuri2.yuri2Server.getMiddleware('pug-support')());
app.use(yuri2.yuri2Server.getMiddleware('state-control')(app));
app.use(router.parse());
app.use(yuri2.yuri2Server.getMiddleware('static')('./public'));
app.use(router.route());
app.listen(8080);