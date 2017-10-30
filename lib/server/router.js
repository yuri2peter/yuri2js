let url = require("url");
let querystring = require("querystring");

class Router {
    constructor() {
        let that=this;
        this.routes = [];
        this.yuri2 = require('../../yuri2');
        this.methodsList=[
            'get',
            'head',
            'put',
            'post',
            'trace',
            'options',
            'delete',
            'lock',
            'mkcol',
            'move',
        ];
        this.methodsList.forEach(function (method) {
            that[method]=function (pathname, handleAction) {
                this._bind(method.toUpperCase(), pathname, handleAction);
            }
        })
    }

    _bind(method, pathname, handleAction) {
        this.routes.push({
            method: method,
            pathname: pathname,
            handleAction: handleAction,
        })
    }

    all(pathname, handleAction) {
        this._bind('ALL', pathname, handleAction);
    }

    route() {
        let that = this;
        const logEnd=function (ctx) {
            !ctx.isEnable('debug')||console.log('[  end] '+ctx.yuri2.yuri2Format.dateFormat() + ' ' + ctx.req.method + ' ' + ctx.req.url);
        };
        return async function (ctx, next) {
            that._parseHandle(ctx);//url预处理

            //添加isGet,isPost等方法
            that.methodsList.forEach(function (method) {
                ctx.req['is'+that.yuri2.yuri2Format.UpperCaseFirst(method)]=method.toUpperCase()===ctx.req.method;
            });

            //循环调用路由表
            let handleAction = null;
            search:
                for (let index = 0; index < that.routes.length; index++) {
                    let item = that.routes[index];
                    if (item.method !== 'ALL' && item.method !== ctx.req.method) continue;//method检查

                    //pathname检查
                    if (that.yuri2.util.isRegExp(item.pathname)) {
                        //正则表达式
                        let matches = ctx.req.pathname.match(item.pathname);
                        if (matches) {
                            ctx.req.params = matches;
                            handleAction = item.handleAction;
                            if (handleAction) {
                                let rel = await handleAction(ctx);
                                if (rel === true) {
                                    logEnd(ctx);
                                    return;
                                }
                                if (rel !== false) {
                                    logEnd(ctx);
                                    await next();
                                    return;
                                }
                            }
                        }
                    }
                    else {
                        //标准式
                        let paths_require = that.yuri2.skipEmptyStringForArray(item.pathname.split('/'));
                        let paths_real = that.yuri2.skipEmptyStringForArray(ctx.req.pathname.split('/'));
                        if (paths_require.length !== paths_real.length) {
                            continue search;
                        } //直接下一位~
                        let params = {};
                        let isPathMatch = true;
                        for (let i = 0; i < paths_require.length; i++) {
                            if (!paths_real[i]) {
                                isPathMatch = false;
                                break;//匹配不到对应字段
                            }
                            let matches = null;
                            if (matches = paths_require[i].match(/^:(\w+)$/)) {
                                //参数路由
                                let param_name = matches[1]; //参数名
                                params[param_name] = paths_real[i]; //保存路由参数
                            } else if (paths_require[i] !== paths_real[i]) {
                                isPathMatch = false;
                                break;//不匹配path
                            }
                        }
                        if (isPathMatch) {
                            ctx.req.params = params;
                            handleAction = item.handleAction;
                            if (handleAction) {
                                let rel = await handleAction(ctx);
                                if (rel === true) {
                                    logEnd(ctx);
                                    return;
                                }
                                if (rel !== false) {
                                    logEnd(ctx);
                                    await next();
                                    return;
                                }
                            }
                        }
                    }
                }

            that.handleNotFound(ctx);
            await next();
        };
    }

    handleNotFound(ctx) {
        !ctx.isEnable('debug') || this.yuri2.dump(`All routes not match: ${ctx.req.method} ${ctx.req.pathname}`);
        ctx.res.setState(404);
    }

    load(module) {
        let that = this;
        const yuri2File = this.yuri2.yuri2File;
        const fs = require('fs');
        if (yuri2File.isDir(module)) {
            //遍历文件夹，加载所有路由表
            let files = fs.readdirSync(module);
            files.forEach(function (file, index) {
                let curPath = module + "/" + file;
                that.load(curPath);
            });
        } else {
            require(module)(this);
        }
        return this;
    }

    _parseHandle(ctx) {
        let _url = ctx.$req.url;
        let urlParsed = url.parse(_url);
        let gets = this.yuri2.yuri2Format.queryToJson(urlParsed.query);
        ctx.req.pathname = this.yuri2.yuri2Format.urlDecode(urlParsed.pathname);
        ctx.req.query = urlParsed.query;
        ctx.req.gets = gets;
        ctx.req.status = ctx.$req.statusCode;
        !ctx.isEnable('debug')||console.log('[begin] '+this.yuri2.yuri2Format.dateFormat() + ' ' + ctx.req.method + ' ' + ctx.req.url);

    }
}

module.exports = function (options = {}) {
    let router = new Router();
    if (options.route && typeof options.route === 'function') {
        options.route(router);
    }
    if (options.dir) {
        router.load(options.dir);
    }
    return router.route();
};