class CliController {
    constructor(server) {
        const that = this;
        this.server = server; //1.running 0.pause
        this.state = 1; //1.running 0.pause
        this.countReq = 0;
        this.countOnline = 0;
        this.countErr = 0;
        this.cli = require('../../yuri2').yuri2Cli();
        let cli = this.cli;
        this.yuri2 = require('../../yuri2');

        //命令行监听命令
        cli.on('line', function (line) {
            let parts = line.split(' ');
            if (parts.shift() === that.server.data.name) {
                that.action(parts.join(' '));
            }
        });

        //子进程监听命令
        // process.on('message',function (line) {
        //     let parts=line.toString().split(' ');
        //     if(parts.shift()===that.server.data.name){
        //         that.action(parts.join(' '));
        //     }
        // });

        server.on('start', function () {
            that.log(`Cli control is enable.Press "${that.server.data.name} help" for more information.`)
        });
    }

    action(order) {
        const that = this;
        switch (order) {
            case ('help'): {
                this.log(`
state : show the states of server.
pause : pause the server.
resume: resume the server.
stop  : stop the server.
`);
                break;
            }
            case ('state'): {
                this.log(`
state:${(this.state === 1 ? 'running' : 'paused')}
startTime:${this.yuri2.yuri2Format.dateFormat(this.server.state.startTime)}
runningTime:${function () {
                        let time = that.yuri2.yuri2Format.msToTime(new Date() - that.server.state.startTime);
                        return `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s `;
                    }()}
countRequest:${this.countReq}
countOnline:${this.countOnline}
countError:${this.countErr}
`
                );
                break;
            }
            case ('pause'): {
                this.state = 0;
                this.server.emit('pause');
                this.log('Server paused.');
                break;
            }
            case ('resume'): {
                this.state = 1;
                this.server.emit('resume');
                this.log('Server resumed.');
                break;
            }
            case ('stop'): {
                if (this.countOnline === 0) {
                    this.server.stop();
                    this.log('The server has been safely shut down.');
                } else {
                    this.log('The server cannot be closed because there is still some online requests.');
                }
                break;
            }
            case ('stop -f'): {
                this.server.stop();
                this.log('The server has been shut down forced.');
                break;
            }
        }

    }

    log(msg) {
        console.log(this.server.data.name + "> " + msg);
    };

    getState() {
        return this.state;
    }

    logCountReq() {
        this.countReq++;
    }

    addCountOnline() {
        this.countOnline++;
    }

    declineCountOnline() {
        this.countOnline--;
    }

    addCountErr() {
        this.countErr++;
    }

}

module.exports = function (server) {
    let ctrl = new CliController(server);
    return async function (ctx, next) {
        ctx.on('error', function () {
            ctrl.addCountErr();
        });
        ctx.on('end', function () {
            ctrl.declineCountOnline();
        });
        if (ctrl.getState() === 1) {
            ctrl.logCountReq();
            ctrl.addCountOnline();
            await next();
        } else {
            ctx.res.setState(503);
            ctx.res.send('服务器正在升级维护中，请稍候。\nServer maintenance is in process. Please wait.');
        }
    }
};