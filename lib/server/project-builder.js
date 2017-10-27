module.exports = function (name, path) {
    const yuri2 = require('../../yuri2');
    path = yuri2.path.resolve(path);
    let dir = path + '/' + name;
    let dirs = [
        dir + '/business',
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
/** app启动文件 */
const yuri2 = require('../yuri2');
let app = yuri2.yuri2App.create({
    name:'${name}',
    debug:true,
    port:8080,
    tpl:'ejs',//默认模板引擎
    dir:__dirname,
});
app.use('spirit');//右下角时间提示
app.use('logger');//日志
app.use('not-found',({msg:['天啊，那页失踪了','返回首页'], home:'/'}));//404提示
app.use('cookie');
app.use('session-mem',{name:'yuri2-js-session-id',timeout:600});
app.use('csrf');
app.use('pug-support');//pug模板引擎支持
app.use('ejs-support');//ejs模板引擎支持
app.use('cli-control');//命令行控制工具
app.use('router',({
    //引导路由
    dir:__dirname+'/routes',
    route:function (router) {
        app.use('router-captcha-svg',{router:router});//svg-captcha
        app.use('router-static',{router:router,dir:__dirname+'/static'}); //静态资源
        app.use('router-business',{router:router,dir:__dirname+'/business'});//一个默认的路由指引，基于文件检索
    }
}));
app.listen();
    `,
        },
        {
            file:`${dir}/routes/hello.js`,
            content:`
module.exports=function (router) {
    router.get('/',async function (ctx,next) {
        ctx.res.send("<h1>Hello Yuri2JS</h1>");
        await ctx.session.load();
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