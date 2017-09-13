const Event = require('events');
const http = require('http');
const util = require('util');
const url = require("url");
const fs = require('fs');
const os = require("os");

module.exports={

    fs:fs,
    http:http,
    util:util,
    url:url,
    os:os,
    yuri2Cache:require("./lib/cache"),
    yuri2File:require("./lib/file"),
    yuri2Lock:require("./lib/lock"),
    yuri2Format:require("./lib/format"),
    yuri2Array:require("./lib/array"),
    yuri2Crypto:require("./lib/crypto"),

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

    inspect(value){
        return util.inspect(value)
    },
    randInt: function (n, m) {
        let c = m - n + 1;
        return Math.floor(Math.random() * c + n);
    },



};