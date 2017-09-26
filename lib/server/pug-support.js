const pug=require('pug');
const yuri2=require('../../yuri2');

const render=function (file,params) {
    let html = pug.renderFile(file,yuri2.jsonMerge({cache:!this.ctx.data.debug,pretty:true},params));
    this.send(html);
};

module.exports = function () {
    return async function (ctx, next) {
        ctx.res.render=render;
        await next();
    }
};