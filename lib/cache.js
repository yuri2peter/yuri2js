let data={};

module.exports={
    get(key){
        return this.has(key)?data[key].value:undefined;
    },
    has(key){
        if(data[key]!==undefined){
            let e=data[key];
            if(e.expireIn===-1 ||e.expireIn-new Date().getTime()>0){
                return true;
            }
        }
        return false;
    },
    set(key,value,expire=0){
        data[key]={
            key:key,
            value:value,
            expireIn:expire?(new Date().getTime())+expire:-1
        };
    },

    //保存当前的缓存数据到文件
    save(filename){

    }
}