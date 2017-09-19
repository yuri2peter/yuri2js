module.exports=class{
    constructor(){
        this.isFinished=false;
    }
    done(){
        this.isFinished=true;
    }
    async wait(max_time=10000){
        const yuri2=require('../yuri2');
        let time_spend=0;
        while (!this.isFinished){
            await yuri2.sleep(1);
            time_spend+=1;
            if(time_spend>max_time){
                return false;
            }
        }
        return true;
    }
};