const Event = require('events');
const http = require('http');
const util = require('util');
const url = require("url");
const fs = require('fs');
const path = require('path');
const os = require("os");

const uuidV1 = require('uuid/v1');


module.exports=yuri2js={

    fs:fs,
    http:http,
    util:util,
    url:url,
    os:os,
    path:path,
    requestPromise:require("request-promise"),
    cheerio:require("cheerio"),
    commander:require("commander"),
    colors:require("colors"),
    pug:require("pug"),
    sequelize:require("sequelize"),

    yuri2Cache:require("./lib/cache"),
    yuri2File:require("./lib/file"),
    yuri2Lock:require("./lib/lock"),
    yuri2Format:require("./lib/format"),
    yuri2Array:require("./lib/array"),
    yuri2Crypto:require("./lib/crypto"),
    yuri2App:require("./lib/app"),
    yuri2WaitMe:require("./lib/wait-me"),
    yuri2Cli:require("./lib/cli"),

    /**
     * 如果arr中的元素存在空字符串''，则去掉该空字符串
     * @returns {Array}
     */
    skipEmptyStringForArray: arr => {
        let a = [];
        for (let i in arr) {
            if ('' !== arr[i]) {
                a.push(arr[i]);
            }
        }
        return a;
    },
    /**
     * 删除加载缓存并加载模块
     * @return object (exports)
     * */
    requireWithoutCache(requirePath){
        delete require.cache[require.resolve(requirePath)];
        return require(requirePath);
    },
    /** 替换全部
     * @return string */
    strReplaceAll(str,needle,replace){
        return str.split(needle).join(replace)
    },
    /** sleep
     * @usage await sleep(3000); */
    sleep(time) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, time);
        })
    },
    dump(value){
        console.log(value);
    },
    inspect(value,pre=false){
        let ins= util.inspect(value);
        return pre?`<pre>${ins}</pre>`:ins;
    },
    uuid(){
        return uuidV1();
    },
    randInt: function (n, m) {
        let c = m - n + 1;
        return Math.floor(Math.random() * c + n);
    },
    /** 
     * 从koa2提取的composer设计
     * 返回一个接受ctx形参的方法
     * @param  middlewares array 中间件的数组
     * 形如[
     *    async function(ctx,next){
     *      //do something...
     *      await next();
     *    },
     *    async function(ctx,next){
     *      //do something...
     *      await next();
     *      //do something...
     *    },
     * ]
     * 
     * */
    compose:function (middlewares) {
        if (!Array.isArray(middlewares)) throw new TypeError('Middleware stack must be an array!');
        for (const fn of middlewares) {
            if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
        }

        /**
         * @param {Object} context
         * @return {Promise}
         * @api public
         */

        return function (context, next) {
            // last called middleware #
            let index = -1;
            return dispatch(0);
            function dispatch (i) {
                if (i <= index) return Promise.reject(new Error('next() called multiple times'));
                index = i;
                let fn = middlewares[i];
                if (i === middlewares.length) fn = next;
                if (!fn) return Promise.resolve();
                try {
                    return Promise.resolve(fn(context, function next () {
                        return dispatch(i + 1)
                    }))
                } catch (err) {
                    return Promise.reject(err)
                }
            }
        }
    },

    /**
     * 合并两个json数组，后者覆盖前者相同的key，返回新的json
     * */
    jsonMerge(json1,json2){
        let rel={};
        for(let i in json1){
            rel[i]=json1[i];
        }
        for(let j in json2){
            rel[j]=json2[j];
        }
        return rel;
    },

    //是否是json对象
    isJson: function (obj) {
        return (typeof(obj) === "object" && Object.prototype.toString.call(obj).toLowerCase() === "[object object]" && !obj.length);
    },

    //字符串 ，是不是以子串开头
    isStartWith(str,strWith){
        if(str.length<strWith.length){return false;}
        let com=str.substring(0,strWith.length);
        return com===strWith
    },

    timestamp(ms=false){
        return ms?Date.now():Math.floor(Date.now()/1000);
    },

    getContentTypeByExt(ext){
        let map=require('./lib/map-mime');
        if(ext===''){ext='.*'}
        if(ext.substr(0, 1)!=='.'){
            ext='.'+ext;
        }
        if(!map[ext]){
            ext='.*';
        }
        return map[ext];
    },

    async(fn){
        return new Promise(fn)
    }
};