const cookie = require('cookie');
const yuri2 = require('../../yuri2');

class Cookie {
    constructor(ctx) {
        this.ctx = ctx;
    }

    parse() {
        return cookie.parse(this.ctx.$req.headers.cookie || '');
    }

    serialize(name, value, options = 3 * 30 * 24 * 3600) {
        if (!isNaN(options)) {
            options = {maxAge: options}
        }
        if (yuri2.isJson(value)) {
            value = JSON.stringify(value)
        }
        let str = cookie.serialize(name, String(value), options);
        this.ctx.res.setHeader('Set-Cookie', str, false);
    }
}

module.exports = function () {
    return async function (ctx, next) {
        let c = new Cookie(ctx);
        ctx.req.cookies = c.parse();
        ctx.res.setCookie = function (name, value, options = 3 * 30 * 24 * 3600) {
            c.serialize(name, value, options);
        };
        await next();
    };
};