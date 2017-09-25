module.exports=class{
    constructor(aim=1){
        this.aim=aim;
    }
    done(){
        return --this.aim;
    }
    /**
     * @param timeout int (ms) */
    async wait(timeout=1000){
        const yuri2=require('../yuri2');
        let timeNow=yuri2.timestamp(true);
        while (this.aim>0){
            await yuri2.sleep(1);
            if(yuri2.timestamp(true)>timeNow+timeout){
                return false;
            }
        }
        return true;
    }
};