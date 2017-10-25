module.exports = function () {
    return async function (ctx, next) {
        const startDate = new Date();
        if(ctx.isEnable('debug')){ctx.enable('spirit')}
        await next();
        if (!ctx.isEnable('spirit')) { return; }
        let type=null;
        for (let i in ctx.res._headers){
            let name= ctx.res._headers[i][0];
            if(name==='Content-Type'){
                type=ctx.res._headers[i][1];
            }
        }
        if(!type||!/text\/html/i.test(type)){return;}//不是html文档，不显示精灵
        ctx.res.send(`
<div id="yuri2js-spirit" title="${ctx.req.id}" style="
    position: fixed;
    right: 0;
    bottom: 0;
    border-radius: 0.9em 0 0 0;
    font-size: 12px;
    padding: 0.6em;
    background :linear-gradient(#50866a,#85c194);
    color: white;
    cursor: pointer;
">
    ${ctx.req.method} ${new Date() - startDate}ms
</div>`);
    }
};