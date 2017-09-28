const yuri2js = require('../../yuri2');
let args = process.argv;
if (args[2]) {
    if (!yuri2js.yuri2File.isFile('./package.json')) {
        yuri2js.yuri2File.filePutContent('./package.json',
            `{
  "name": "yuri2js-project",
  "version": "0.0.1",
  "dependencies": {
    "yuri2js": "*"
  }
}
`);
        console.log('File "package.json" was created,please run "npm install" later.');
    } else {
        console.log('File "package.json" detected.');
    }
    let name = args[2];
    yuri2js.yuri2Server.build(name, './');
}else{
    console.log(`Parameter "name" is required.For example "server-build my-app".`);
}