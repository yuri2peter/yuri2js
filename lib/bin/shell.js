const yuri2js = require('../../yuri2');
let args = process.argv;

switch (args[2]){
    case "build":{
        if (args[3]) {
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
            let name = args[3];
            yuri2js.yuri2Server.build(name, './');
        }else{
            console.log(`Parameter "name" is required.For example "build my-app"`);
        }
        break;
    }
    default:
        console.log('[yuri2js] Unknown order.')
}

