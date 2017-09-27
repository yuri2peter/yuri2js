module.exports = function () {
    return async function (ctx, next) {
        const startDate = new Date();
        if(ctx.isEnable('debug')){ctx.enable('spirit')}
        await next();
        if (!ctx.isEnable('spirit')) {
            return;
        }
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