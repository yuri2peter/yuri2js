const pug=require('pug');
const yuri2=require('../../yuri2');

const render=function (file,params={}) {
    if(!file){file=this.ctx.dir+this.ctx.req.pathname}
    if(yuri2.isJson(file)){
        params=file; //省略file，直接赋值params
    }
    let html = pug.renderFile(file,yuri2.jsonMerge({cache:!this.ctx.isEnable('debug'),pretty:true},params));
    this.send(html);
};

module.exports = function () {
    return async function (ctx, next) {
        ctx.res.render=render;
        await next();
    }
};