const log = console.log;

const yuri2 = require('../yuri2');

let app = yuri2.yuri2Server.createServer({
    name:'app1',
    spirit:true,
    debug:true,
});
let router = yuri2.yuri2Server.createRouter().load(__dirname+'/route_table');

// app.use(yuri2.yuri2Server.getMiddleware('spirit')());
app.use(yuri2.yuri2Server.getMiddleware('cookie-session')());
app.use(yuri2.yuri2Server.getMiddleware('state-control')(app));
app.use(router.parse());
app.use(yuri2.yuri2Server.getMiddleware('static')('./public'));
app.use(router.route());
app.listen(8080);