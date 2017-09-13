const log=console.log;
log('test start');

const yuri2=require('../yuri2');

let handle=async ()=>{
    log(yuri2.yuri2Crypto.md5('abc'));

    log('test finished')
};

handle().then();
