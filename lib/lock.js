module.exports={
    _locks:{},
    /**
     * @param lockName string
     * @param callback callback
     * @param timeout int
     * */
    async lock(lockName,callback,timeout=300){
        let that=this;
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
    },

    unlock(lockName){
        delete this._locks[lockName];
    }

};