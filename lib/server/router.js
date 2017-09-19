let url = require("url");
let querystring = require("querystring");
module.exports = class {
    constructor() {
        this.routes = [];
        this.yuri2 = require('../../yuri2');
    }

    _bind(method, pathname, handleAction) {
        this.routes.push({
            method: method,
            pathname: pathname,
            handleAction: handleAction,
        })
    }

    get (pathname, handleAction) {
        this._bind('GET', pathname, handleAction);
    }

    head(pathname, handleAction) {
        this._bind('HEAD', pathname, handleAction);
    }

    put(pathname, handleAction) {
        this._bind('PUT', pathname, handleAction);
    }

    post(pathname, handleAction) {
        this._bind('POST', pathname, handleAction);
    }

    trace(pathname, handleAction) {
        this._bind('TRACE', pathname, handleAction);
    }

    options(pathname, handleAction) {
        this._bind('OPTIONS', pathname, handleAction);
    }

    delete(pathname, handleAction) {
        this._bind('DELETE', pathname, handleAction);
    }

    lock(pathname, handleAction) {
        this._bind('LOCK', pathname, handleAction);
    }

    mkcol(pathname, handleAction) {
        this._bind('MKCOL', pathname, handleAction);
    }

    move(pathname, handleAction) {
        this._bind('MOVE', pathname, handleAction);
    }


    route() {
        let that = this;
        return async function (ctx, next) {
            //url预处理
            let _url = ctx.$req.url;
            let urlParsed = url.parse(_url);
            let gets = querystring.parse(urlParsed.query);
            ctx.req.pathname = that.yuri2.yuri2Format.urlDecode(urlParsed.pathname);
            ctx.req.query = urlParsed.query;
            ctx.req.gets = gets;
            ctx.req.status = ctx.$req.statusCode;

            //循环调用路由表
            let notFound = true;
            let handleAction = null;
            for (let index = 0; index < that.routes.length && notFound; index++) {
                let item = that.routes[index];
                //method检查
                if (item.method !== ctx.req.method) {
                    continue;
                }
                //pathname检查
                if (that.yuri2.util.isRegExp(item.pathname)) {
                    //正则表达式
                    let matches = ctx.req.pathname.match(item.pathname);
                    if (matches) {
                        ctx.req.params = matches;
                        notFound = false;
                        handleAction = item.handleAction;
                        break;
                    }
                } else {
                    //标准式
                    let paths_require = that.yuri2.skipEmptyStringForArray(item.pathname.split('/'));
                    let paths_real = that.yuri2.skipEmptyStringForArray(ctx.req.pathname.split('/'));
                    if (paths_require.length !== paths_real.length) {
                        continue;
                    } //直接下一位~
                    let params = {};
                    let isPathMatch=true;
                    for (let i = 0; i < paths_require.length; i++) {
                        if (!paths_real[i]) {
                            isPathMatch=false;
                            break;//匹配不到对应字段
                        }
                        let matches = null;
                        if (matches = paths_require[i].match(/^:(\w+)$/)) {
                            //参数路由
                            let param_name = matches[1]; //参数名
                            params[param_name] = paths_real[i]; //保存路由参数
                        } else if (paths_require[i] !== paths_real[i]) {
                            isPathMatch=false;
                            break;//不匹配path
                        }
                    }
                    if(isPathMatch){
                        ctx.req.params = params;
                        notFound = false;
                        handleAction = item.handleAction;
                    }
                }
            }

            if (!notFound && handleAction) {
                await handleAction(ctx, next);
            }else{
                that.yuri2.dump(`All routes not match: ${ctx.req.method} ${ctx.req.pathname}`);
                await next();
            }
        };
    }
};