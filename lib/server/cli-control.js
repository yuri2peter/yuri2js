class CliController {
    constructor(app) {
        const that = this;
        this.app = app; //1.running 0.pause
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
            if (parts.shift() === that.app.data.name) {
                that.action(parts.join(' '));
            }
        });

        //子进程监听命令
        // process.on('message',function (line) {
        //     let parts=line.toString().split(' ');
        //     if(parts.shift()===that.app.data.name){
        //         that.action(parts.join(' '));
        //     }
        // });

        app.on('start', function () {
            that.log(`Cli control is enable.Press "${that.app.data.name} help" for more information.`)
        });
    }

    action(order) {
        const that = this;
        switch (order) {
            case ('help'): {
                this.log(`
state : show the states of app.
pause : pause the app.
resume: resume the app.
stop  : stop the app.
`);
                break;
            }
            case ('state'): {
                this.log(`
state:${(this.state === 1 ? 'running' : 'paused')}
startTime:${this.yuri2.yuri2Format.dateFormat(this.app.state.startTime)}
runningTime:${function () {
                        let time = that.yuri2.yuri2Format.msToTime(new Date() - that.app.state.startTime);
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
                this.app.emit('pause');
                this.log('Server paused.');
                break;
            }
            case ('resume'): {
                this.state = 1;
                this.app.emit('resume');
                this.log('Server resumed.');
                break;
            }
            case ('stop'): {
                if (this.countOnline === 0) {
                    this.app.stop();
                    this.log('The app has been safely shut down.');
                } else {
                    this.log('The app cannot be closed because there is still some online requests.');
                }
                break;
            }
            case ('stop -f'): {
                this.app.stop();
                this.log('The app has been shut down forced.');
                break;
            }
        }

    }

    log(msg) {
        console.log(this.app.data.name + "> " + msg);
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

module.exports = function (options) {
    let app=options.app;
    let ctrl = new CliController(app);
    return async function (ctx, next) {
        ctx.on('error', function () {
            ctrl.addCountErr();
        });
        ctx.on('end', function () {
            ctrl.declineCountOnline();
        });
        if (ctrl.getState() === 1) {
            //正常访问
            ctrl.logCountReq();
            ctrl.addCountOnline();
            await next();
        } else {
            ctx.res.setState(503);
            ctx.res.send('服务器正在升级维护中，请稍候。\nServer maintenance is in process. Please wait.');
        }
    }
};