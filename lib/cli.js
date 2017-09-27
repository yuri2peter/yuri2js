const readline = require('readline');
let cli=null;
module.exports = function (options) {
    if(cli){return cli}
    let yuri2 = require('../yuri2');
    let defaultOptions = {
        hello: 'The cli mode is enabled.',//生效时的提示语
        prompt: 'yuri2cli>',//提示符
        close: 'The process has been closed.',//自动关闭的提示语
    };
    options = yuri2.jsonMerge(defaultOptions, options);

    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.setPrompt(options.prompt);
    if (options.hello) {
        console.log(options.hello)
    }
    rl.on('close', function () {
        console.log(options.close);
        process.exit(0);
    });
    rl.on('line',function (line) {
        if(line==='exit'){
            process.exit(0);
        }
    });
    cli=rl;
    return rl;
};