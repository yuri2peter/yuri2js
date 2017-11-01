const pug=require('pug');
const yuri2=require('../../yuri2');

module.exports = function () {
    return async function (ctx, next) {
        ctx.on('render',function (options) {
            if(options.type && options.type!=='pug' || !options.type && ctx.data.tpl!=='pug' ){return;}
            let configs=yuri2.jsonMerge({cache:!this.isEnable('debug'),pretty:true},options.configs);
            if(options.str){
                //渲染字符串
                let html = pug.render(options.str,yuri2.jsonMerge(configs,options.data));
                this.res.send(html);
            }else{
                //渲染指定文件
                let file=options.file;
                if(!file){file=this.data.dirViews+this.req.pathname+'.pug'};
                let html = pug.renderFile(file,yuri2.jsonMerge(configs,options.data));
                this.res.send(html);
            }
        });
        await next();
    }
};