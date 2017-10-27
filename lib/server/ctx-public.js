//一个简单的初始化数据注册工具，让一些对象可以从ctx访问(特别的，可以用配置的方式连接数据库)
const Sequelize = require('sequelize');
const MongoClient = require('mongodb').MongoClient;
const yuri2 = require('../../yuri2');

class Manager {
    constructor() {
        this.data = {};
    }

    async set(name, fnExec) {
        this.data[name] = await fnExec();
    }

    async setDb(name,options){
        if (options.type==='mongodb'){
            await this.set(name,async function () {
                const url = `mongodb://${options.username?options.username+':'+options.password+'@':''}${options.host}:${options.port?options.port:'27017'}/${options.database}`;
                let rel=null;
                await yuri2.async(function (resolve,reject) {
                    MongoClient.connect(url, function(err, db) {
                        if(err){
                            console.warn(err);
                            !db||db.close();
                            reject()
                        }else{
                            resolve(db);
                        }
                    });
                }).then(function (db) {
                    rel=db;
                });
                return rel;
            })
        }else{
            await this.set(name,function () {
                if(!options.dialect){options.dialect=options.type}
                let db=options.database;delete options.database;
                let usn=options.username;delete options.username;
                let psw=options.password;delete options.password;
                let sequelize = new Sequelize(db, usn, psw, options);
                return sequelize;
            });
        }
    }

    get(name){
        return this.data[name];
    }

}

module.exports = function (options) {
    let manager = new Manager();
    options.fn(manager).then();
    return async function (ctx,next) {
        if(ctx.p){
            console.warn('ctx-public register failed')
        }else{
            ctx.p=manager
        }
        await next();
    }
};