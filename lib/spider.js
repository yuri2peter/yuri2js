const yuri2 = require('../yuri2');
const rp = require('request-promise');
const cheerio = require('cheerio'); // Basically jQuery for node.js
const Event = require('events').EventEmitter;
const Path = require('path');

const Task = class extends Event {
    constructor(options) {
        super();
        let ops = yuri2.jsonMerge({
            url: '',
            home:'',
        }, options);
        this.ops = ops; //配置表
        this.data = {
            url: ops.url,
        };
    }

    async load() {
        const that = this;
        const url = this.ops.url;
        that.emit('begin', url);
        await rp({
            uri: url,
            resolveWithFullResponse: true,
        }).then(function (res) {
            if (res.statusCode !== 200 ||
                !res.headers['content-type'] ||
                !yuri2.yuri2String.isStartWith(res.headers['content-type'], 'text/html')) {
                //不太对
                that.emit('mismatch', that.data);
            } else {
                let $ = cheerio.load(res.body);
                that.data.title = $('title').text();
                that.data.body = res.body;
                that.data.links = [];
                $('body').find('a').each(function (item, el) {
                    let href = $(el).attr('href');
                    href || (href = '');
                    let full = yuri2.url.resolve(url, href);
                    let isInSite = yuri2.yuri2String.isStartWith(full, that.ops.home);
                    if (isInSite) {
                        that.data.links.push(full);
                        that.emit('link', full);
                    }
                });
                that.emit('data', that.data);
            }
        }).catch(function (err) {
            !err || that.emit('error', err);
        });
        that.emit('end', that.data);
    }
};
const Spider = class extends Event {
    constructor(options) {
        super();
        let opt = yuri2.jsonMerge({
            url: '', //启动url
            suffix: [],//后缀过滤，在其中有效。如：['php','html','']
            url_ignores: [], //需要忽略的url
            itv: 300,
            timeout: 60000,
        }, options);
        this.opt = opt; //配置表
        this.url_ignores = opt.url_ignores; //已注册的url
        this.todo = []; //需要完成的任务
        this.inPro = 0; //正在执行的任务
        this.finishs = []; //已完成的任务
        this._switch = false;
        if (opt.url) {
            this.addIgnore(Spider._rmAnchor(opt.url));
            this._pushTask({
                home:opt.home,
                url: opt.url
            })
        }
    }

    static _rmAnchor(url){
        return url.replace(/#.*?$/,'');
    }

    isInIgnores(url) {
        return yuri2.yuri2Array.inArray(url, this.url_ignores);
    }

    addIgnore(url) {
        this.url_ignores.push(url)
    }

    _pushTask(options) {
        this.todo.push(new Task(options))
    }

    //从todo中选取一个进行读取
    _doOnce() {
        const that = this;
        let task = this.todo.shift();
        if (!task) {
            return false;
        }
        that.inPro++;
        that.emit('task', task);
        task.on('mismatch', function (data) {
            // console.warn(data);
        });
        task.on('link', function (link) {
            let data=Spider._rmAnchor(link);
            let last = data.split('/').pop(); //取末尾
            let matches = last.match(/\.([^.]*)#?$/);
            if (!matches) {
                matches = ['', '']
            }
            if (yuri2.yuri2Array.inArray(matches[1], that.opt.suffix) && !that.isInIgnores(data)) {
                that.addIgnore(data);
                that._pushTask({
                    url: data,
                    home:that.opt.home,
                })
            }
        });
        task.on('data', function (data) {
            let hash = yuri2.yuri2String.md5(data.body);
            if (that.isInIgnores(hash)) {
                return;
            }
            that.addIgnore(hash);
            that.finishs.push(data);
            that.emit('data', data);
        });
        task.on('error', function (data) {
            console.warn();
        });
        task.on('end', function () {
            that.inPro--;
        });
        return task.load();
    }

    begin() {
        this.emit('begin');
        const that = this;
        that._switch = true;
        (async function () {
            while (that._switch) {
                await yuri2.sleep(that.opt.itv);
                that._doOnce();
            }
        })();
        setTimeout(function () {
            that.stop(true);
            console.warn('[spider] timeout.')
        }, that.opt.timeout)
    }

    async stop(immediately = false) {
        await yuri2.sleep(2000);
        const that = this;
        !immediately || (this._switch = false);
        while (that.inPro) {
            await yuri2.sleep(500);
        }
        this.emit('end', that.finishs);
    }

    async end() {
        const that = this;
        while (that._switch&&(that.inPro || that.todo.length > 0)) {
            await yuri2.sleep(500);
        }
        this.emit('end', that.finishs);
    }

};

module.exports = function (options) {
    return new Spider(options)
};