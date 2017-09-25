class stateController{
    constructor(server){
        const that=this;
        this.server=server; //1.running 0.pause
        this.state=1; //1.running 0.pause
        this.countReq=0;
        this.countOnline=0;
        this.countErr=0;
        this.cli=require('../../yuri2').yuri2Cli();
        let cli=this.cli;
        const yuri2 = require('../../yuri2');

        cli.on('line',function (line) {
            const orderFixed=function (order) {
                return that.server.data.name+order;
            };
            switch (cli.getOrderPrefix()+line){
                case (orderFixed('help')):{
                    that.log(`
state : show the states of server.
pause : pause the server.
resume: resume the server.
stop  : stop the server.
`);
                    break;
                }
                case (orderFixed('state')):{
                    that.log(`
state:${(that.state===1?'running':'paused')}
startTime:${yuri2.yuri2Format.dateFormat(that.server.state.startTime)}
runningTime:${function () {let time=yuri2.yuri2Format.msToTime(new Date()-that.server.state.startTime);return `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s `;}()}
countRequest:${that.countReq}
countOnline:${that.countOnline}
countError:${that.countErr}
`
                    );
                    break;
                }
                case (orderFixed('pause')):{
                    that.state=0;
                    that.log('Server paused.');
                    break;
                }
                case (orderFixed('resume')):{
                    that.state=1;
                    that.log('Server resumed.');
                    break;
                }
                case (orderFixed('stop')):{
                    if(that.state===0){
                        if(that.countOnline===0){
                            that.server.stop();
                            that.log('The server has been safely shut down.');
                        }else{
                            that.log('The server cannot be closed because there is still some online requests.');
                        }
                    }else{
                        that.log('Please "pause" the server first.');
                    }
                    break;
                }
            }
        });

        cli.setOrderPrefix(this.server.data.name);
        this.log('Stand by.The CLI orderPrefix has been set to '+this.server.data.name)
    }
    log(msg){
        console.log(this.server.data.name+"> "+msg);
    };
    getState(){
        return this.state;
    }
    logCountReq(){
        this.countReq++;
    }
    addCountOnline(){
        this.countOnline++;
    }
    declineCountOnline(){
        this.countOnline--;
    }
    addCountErr(){
        this.countErr++;
    }

}

module.exports=function (server) {
    let ctrl=new stateController(server);
    return async function (ctx,next) {
        ctx.on('error',function () {
            ctrl.addCountErr();
        });
        ctx.on('end',function () {
            ctrl.declineCountOnline();
        });
        if(ctrl.getState()===1){
            ctrl.logCountReq();
            ctrl.addCountOnline();
            await next();
        }else{
            ctx.res.setState(503);
            ctx.res.send('服务器正在升级维护中，请稍候。\nServer maintenance is in process. Please wait.');
        }
    }
};