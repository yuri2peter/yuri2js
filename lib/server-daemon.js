//server的守护进程
const child_process=require('child_process');
const Event=require('events');

class Daemon extends Event{
    constructor(files){
        super();
        const that=this;
        this.children=[];
        files.forEach(function (file) {
            let p = child_process.fork(file);
            p.on('exit', code => {
                that.emit('exit',code)
            });

            p.on('message',function (m) {
                that.emit('message',m)
            });
            that.children.push(p);
        })
    }

    send(m){
        this.children.forEach(function (p) {
            p.send(m);
        })
    }
}

module.exports=function (files=[]) {
    return new Daemon(files);
};