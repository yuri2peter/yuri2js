const log=console.log;
log('test start');

const yuri2=require('../yuri2');

let handle= ()=>{
    let xml=yuri2.yuri2Format.jsonToXml({a:1,b:[1,2,3]});
    log(xml);
    let json=yuri2.yuri2Format.xmlToJson(xml);
    log(json)
};

handle();
log('end');
