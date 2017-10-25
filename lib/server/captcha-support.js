const yuri2 = require('../../yuri2');

module.exports = function (router) {
    router.get('/yuri2js/captcha', async function (ctx, next) {
        let cap = require('svg-captcha');
        let c = cap.create({
            ignoreChars: '0o1iIO',
            color: true,
            noise: 3
        });
        ctx.res.send(c.data);
        ctx.res.setHeader('Content-Type', 'image/svg+xml');
        let s = await ctx.session.load();
        s.yuri2js_captcha = c.text;
    });
    return async function (ctx, next) {
        ctx.captcha || (ctx.captcha = {
            render: function (options = {}) {
                let rand = Math.random();
                let path = "/yuri2js/captcha?rand=";
                let style = 'cursor:pointer;';
                if (options.width) {
                    style += `width:${options.width}px`
                }
                if (options.height) {
                    style += `height:${options.height}px`
                }
                let html = `
                <img src="${path}${rand}" onclick="this.src='${path}'+Math.random()" style="${style}" title="点击刷新(click to refresh)"/>
            `;
                return html;
            }, verify: async function (text) {
                let s = await ctx.session.load();
                if(!s.yuri2js_captcha){return false;}
                return s.yuri2js_captcha.toLowerCase()===text.toLowerCase();
            }
        });
        await next();
    }
};