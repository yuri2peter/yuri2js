const yuri2=require('../../yuri2');
module.exports = function () {
    return async function (ctx, next) {
        const crypto=function (ori) {
              return yuri2.yuri2Crypto.md5(ori);
        };
        ctx.csrf||(ctx.csrf={
            create(secret=ctx.session.getID()){
                return crypto(secret)
            },
            verify(token,secret=ctx.session.getID()){
                return crypto(secret)===token;
            }
        });
        await next();
    };
};