const path=require('path');

module.exports={
    _locks:{},
    /**
     * @param lockName string|array lockA || [dirA,lockA]
     * @param callback callback
     * @param timeout int
     * @return Promise
     * */
    lock(lockName,callback,timeout=300){
        let that=this;
        if(Array.isArray(lockName)){
            let dir=lockName[0];
            let name=lockName[1];
            return new Promise(async function (resolve,reject) {
                const yuri2=require('../yuri2');
                const fs=yuri2.fs;
                if(!yuri2.yuri2File.isDir(dir)){
                    reject(new Error('locker dir not exist'));
                }
                const dirLock=path.join(dir,name);
                const fileLock=path.join(dirLock,process.pid);
                const contentRandom=Math.random()+'';
                let timeNow=new Date();
                let hasLock=false;
                while (!hasLock){
                    await yuri2.sleep(2);
                    let spent=new Date()-timeNow;
                    if (spent>timeout*1000){
                        reject();
                    }
                    await new Promise(function (res,rej) {
                        fs.mkdir(dirLock, function(err) {
                            if (err) rej();
                            fs.writeFile(fileLock,new Buffer(contentRandom), function() {
                                hasLock = true;
                                res();
                            });
                        });
                    })
                }
                //此时已创建文件夹，获得锁
                process.on('exit',function () {
                    //清理意外退出进程导致的死锁
                    const yuri2fs=yuri2.yuri2File;
                    if(yuri2fs.isFile(fileLock)&&yuri2fs.fileGetContent(fileLock,true)===contentRandom){
                        yuri2fs.deleteDir(dirLock)
                    }
                })
            })
        }else{
            return new Promise(async function (resolve,reject) {
                let timeNow=new Date();
                while (that._locks[lockName]){
                    await require('../yuri2').sleep(1);
                    let spent=new Date()-timeNow;
                    if (spent>timeout*1000){
                        reject();
                    }
                }
                that._locks[lockName]=true;
                let unlock=function () {
                    delete that._locks[lockName];
                };
                !callback||await callback().then(unlock).catch(unlock);
                resolve(lockName);
            })
        }
    },

    /**
     * @param lockName string|array lockA || [dirA,lockA]
     * */
    unlock(lockName){
        if(Array.isArray(lockName)) {
            let dir=lockName[0];
            let name=lockName[1];
            const dirLock=path.join(dir,name);
            const yuri2=require('../yuri2');
            yuri2.yuri2File.deleteDir(dirLock)
        }else{
            delete this._locks[lockName];
        }
    }

};