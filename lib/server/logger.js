const yuri2=require('../../yuri2');

class Logger{
    constructor(dir){
        this.file=dir+'/logs/'+yuri2.yuri2Format.dateFormat('yyyy-MM-dd')+'.log';
        if (!yuri2.yuri2File.isFile(this.file)){
            yuri2.yuri2File.filePutContent(this.file,''); //创建日志文件
        }
    }
    log(content,type='info'){
        if(typeof content!=='string'){
            content=yuri2.inspect(content);
        }
        content=yuri2.yuri2Format.dateFormat('yyyy-MM-dd hh:mm:ss.S')+` [${type}] `+content+'\r\n';
        yuri2.fs.appendFile(this.file,content, (err) => {
            if (err) throw err;
        });
    }
}

module.exports=function (server) {
    const logger=new Logger(server.data.dir);
    server.data.logger=true;
    server.on('pause',function () {
        logger.log('server paused.','state-control')
    });
    server.on('resume',function () {
        logger.log('server resumed.','state-control')
    });
    server.on('close',function () {
        logger.log('the server has been safely shut down.','state-control')
    });
    server.on('error',function (e) {
        logger.log(e,'error')
    });
    return async function (ctx,next) {
        ctx.log||(ctx.log=function (content) {
            logger.log(content)
        });
        await next();
    }
};