const ejs=require('ejs');
const yuri2=require('../../yuri2');

module.exports = function () {
    return async function (ctx, next) {
        ctx.on('render',function (options) {
            let that=this;
            if(options.type!=='ejs' && ctx.data.tpl!=='ejs'){return;}
            let configs=yuri2.jsonMerge({
                cache:!this.isEnable('debug'),
                compileDebug:this.isEnable('debug')
            },options.configs);
            if(options.str){
                //渲染字符串
                let html=ejs.render(options.str, options.data, configs);
                this.res.send(html);
            }else{
                //渲染指定文件
                let file=options.file;
                if(!file){file=this.dir+'/views'+this.req.pathname+'.ejs'};
                ejs.renderFile(file,options.data,configs,function(err, str){
                    if (err){
                        throw new Error(err);
                    }else{
                        that.res.send(str);
                    }
                });
            }
        });
        await next();
    }
};