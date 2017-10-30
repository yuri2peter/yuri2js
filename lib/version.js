const yuri2js=require('../yuri2');
let file = __dirname + '/../package.json';
let v='unknown';
if (yuri2js.yuri2File.isFile(file)) {
    let content = yuri2js.yuri2File.fileGetContent(file, true);
    let preg = /"version"\s*:\s*"(.*)"/;
    let matches = content.match(preg);
    if (matches) {
        v=matches[1];
    }
}
module.exports=v;