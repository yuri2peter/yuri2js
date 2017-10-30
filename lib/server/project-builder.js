module.exports = function (name, path) {
    const yuri2 = require('../../yuri2');
    path = yuri2.path.resolve(path);
    let dir = path + '/' + name;
    let dirs = [
        dir + '/business',
        dir + '/data',
        dir + '/libs',
        dir + '/logs',
        dir + '/models',
        dir + '/routes',
        dir + '/runtime',
        dir + '/static',
        dir + '/temp',
        dir + '/views',
        dir + '/db',
    ];
    dirs.forEach(function (dir) {
        yuri2.yuri2File.mkdir(dir)
    });

    let codes = [
        {
            file: `${dir}/index.js`,
            content: `
/** app启动文件 */
const yuri2 = require('yuri2js');
let app = yuri2.yuri2App.create({
    name:'${name}', //app名字
    debug:true, //debug模式
    port:8080, //端口
    autoRelease:true, //可被强制释放
    tpl:'ejs',//默认模板引擎
    dir:__dirname, //app文件夹
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
app.use('ctx-public', {file: __dirname+'/db/init.js'});//ctx快捷访问支持工具
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
/** 路由文件 */
const yuri2 = require('yuri2js');
module.exports = function (router) {
    router.get('/', async function (ctx) {
        let s = await ctx.session.load();
        s.counter || (s.counter = 0);
        ctx.res.send(\`<h3>counter:\${s.counter}</h3>\`);
        if (Math.random() > 0.9) ctx.session.changeID();
        s.counter++;

        ctx.res.send(\`<h3>method:\${ctx.req.method}</h3>\`);
        ctx.res.send(\`<h3>csrf:\${ctx.csrf.create()}</h3>\`);
        ctx.res.send(\`<h3>captcha----</h3>\${ctx.captcha.render({height: 80})}\`);
        ctx.res.send(\`<form action="" method="post"><input name="code"><input type="submit" value="check"></form>\`);
        ctx.res.send(\`<h3>cookies----</h3>\`);
        ctx.dump(ctx.req.cookies);
        ctx.res.send(\`<h3>session----</h3>\`);
        ctx.dump(s);
    });
    router.post('/', async function (ctx) {
        ctx.res.send(\`<h3>method:\${ctx.req.method}</h3>\`);
        await ctx.bodyParse(async function (err, rel) {
            if (!err) {
                ctx.res.send(\`<h3>Your code :\${rel.code}</h3>\`);
                ctx.res.send(\`<h2>Is right? \${await ctx.captcha.verify(rel.code) ? 'YES' : 'NO'}</h2>\`);
                ctx.res.send(\`<h4>Returning to the previous page...\`);
                ctx.res.send("<script>setTimeout(function() { history.go(-1) },2000);</script>");
            }
        });
    });
};
`,
        },
        {
            file:`${dir}/db/init.js`,
            content:`
/** 数据库配置文件 */
const yuri2 = require('yuri2js');
module.exports=async function(p){
    p.setDb('mysql-test',{
        type: 'mysql',
        host: 'localhost',
        database:'test',
        username:'root',
        password:'root',
        operatorsAliases:false,
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
    });
    p.setDb('mongodb-test',{
        type: 'mongodb',
        host: 'localhost',
        database:'test',
        username:'root',
        password:'root',
    });
};`,
        },
    ];
    codes.forEach(function (code) {
        yuri2.yuri2File.filePutContent(code.file,code.content);
    });
    console.log(`The project ${name} has been built.Run the script "${dir}/index.js" for testing.`)
};