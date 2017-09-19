const log = console.log;

const yuri2 = require('../yuri2');

let app = yuri2.yuri2Server.createServer();
let router = yuri2.yuri2Server.createRouter();
app.use(yuri2.yuri2Server.getMiddleware('./server/spirit'));
require('./route_table')(router);
app.use(router.route());
app.listen(8080);
