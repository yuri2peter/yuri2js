const yuri2 = require('../../yuri2');

module.exports = function (options) {
    options = yuri2.jsonMerge({
        dir: './business',
    }, options);
    let router = options.router;
    if (!yuri2.yuri2File.isDir(options.dir)) {
        throw new Error('route-business:main dir is not exist(set {dir:"your dir for business"}).')
    }
    const bus = async function (ctx,path) {
        path=path||ctx.req.pathname;
        let file = options.dir + path + '.js';
        if (!yuri2.yuri2File.isSubDir(file, options.dir)) {
            return false;
        } //如果路径不是子目录下无效，防止../非法访问
        let handle;
        try {
            if (ctx.isEnable('debug')) {
                handle = yuri2.requireWithoutCache(file);
            } else {
                handle = require(file);
            }
        } catch (e) {
            return false;
        }
        if (typeof handle === 'function')
            return await handle(ctx);
        else
            return false;

    };
    router.all(/./, bus);
    return async function (ctx, next) {
        ctx.business = async function (path) {
            return await bus(ctx,path);
        };
        await next();
    };
};