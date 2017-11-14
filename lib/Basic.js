const Event=require('events').EventEmitter;
class Basic extends Event{
    constructor(){
        super();
        this.yuri2=require('../yuri2');
        this._yuri2_data={};
    }

    set(key,val){
        this._yuri2_data[key]=val;
    }

    get(key){
        return this._yuri2_data[key];
    }

}

module.exports=Basic;