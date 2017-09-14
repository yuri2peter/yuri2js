module.exports={
    _locks:{},
    async lock(lockName,callback){
        let that=this;
        return new Promise(async function (resolve,reject) {
            while (that._locks[lockName]){
                await require('../yuri2').sleep(10);
            }
            that._locks[lockName]=true;
            let unlock=function () {
                that._locks[lockName]=false;
            };
            await callback().then(unlock).catch(unlock);
            resolve(lockName);
        })
    }
};