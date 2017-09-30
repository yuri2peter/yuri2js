module.exports = function (name, path) {
    const yuri2 = require('../../yuri2');
    path = yuri2.path.resolve(path);
    let dir = path + '/' + name;
    let dirs = [
        dir + '/data',
        dir + '/lib',
        dir + '/logs',
        dir + '/models',
        dir + '/routes',
        dir + '/runtime',
        dir + '/static',
        dir + '/temp',
        dir + '/views',
    ];
    dirs.forEach(function (dir) {
        yuri2.yuri2File.mkdir(dir)
    });

    let codes = [
        {
            file: `${dir}/index.js`,
            content: `
const yuri2 = require('yuri2js');
let app = yuri2.yuri2Server.create({
    name:'${name}',
    debug:true,
    port:8080,
    dir:__dirname
});
let router = yuri2.yuri2Server.getMiddleware('router')().load(__dirname+'/routes');//路由
app.use(yuri2.yuri2Server.getMiddleware('spirit')());//右下角时间提示
app.use(yuri2.yuri2Server.getMiddleware('logger')(app));//日志
app.use(yuri2.yuri2Server.getMiddleware('not-found')({msg:['天啊，那页失踪了','返回首页'], home:'/'}));//404提示
app.use(yuri2.yuri2Server.getMiddleware('cookie')());
app.use(yuri2.yuri2Server.getMiddleware('session-mem')(app,{name:'yuri2-js-session-id',timeout:600}));
app.use(yuri2.yuri2Server.getMiddleware('csrf')());//csrf预防工具
app.use(yuri2.yuri2Server.getMiddleware('pug-support')());//pug模板引擎支持
app.use(router.parse());//解析路由
app.use(yuri2.yuri2Server.getMiddleware('cli-control')(app));//命令行控制工具
app.use(yuri2.yuri2Server.getMiddleware('static')());
app.use(router.route());//引导路由
app.listen();
    `,
        },
        {
            file:`${dir}/routes/hello.js`,
            content:`
module.exports=function (router) {
    router.get('/',async function (ctx,next) {
        ctx.res.send("<h1>Hello Yuri2JS</h1>");
        ctx.session.load();
        let s = ctx.session.data;
        s.counter || (s.counter = 0);
        ctx.res.send(\`<h3>session_id:\${ctx.session.getID()}</h3>\`);
        ctx.res.send(\`<h3>counter:\${s.counter}</h3>\`);
        ctx.res.send(\`<h3>csrf:\${ctx.csrf.create()}</h3>\`);
        if(Math.random()>0.9){
            ctx.session.changeID();
        }
        s.counter++;
        await next();
    });
};`,
        },
    ];
    codes.forEach(function (code) {
        yuri2.yuri2File.filePutContent(code.file,code.content);
    });
    console.log(`The project ${name} has been built.Run the script "${dir}/index.js" for testing.`)
};