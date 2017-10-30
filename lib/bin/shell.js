#! /usr/bin/env node
const yuri2js = require('../../yuri2');
let args = process.argv;

switch (args[2]) {
    case "build": {
        if (args[3]) {
            if (!yuri2js.yuri2File.isFile('./package.json')) {
                yuri2js.yuri2File.filePutContent('./package.json',
                    `{
  "name": "yuri2js-project",
  "version": "0.0.1",
  "dependencies": {}
}
`);
                console.log('[yuri2js] File "package.json" was created.');
            } else {
                console.log('[yuri2js] File "package.json" detected.');
            }
            let name = args[3];
            yuri2js.yuri2App.build(name, './');
            console.log(`[yuri2js] App "${name}" build complete.`);
        } else {
            console.log(`[yuri2js] Parameter "name" is required.For example "yuri2js build my-app"`);
        }
        break;
    }
    case 'version': {
        let file = __dirname + '/../../package.json';
        if (yuri2js.yuri2File.isFile(file)) {
            // "version": "1.1.2",
            let content = yuri2js.yuri2File.fileGetContent(file, true);
            let preg = /"version"\s*:\s*"(.*)"/;
            let matches = content.match(preg);
            if (matches) {
                console.log('[yuri2js] Version:' + matches[1])
            } else {
                console.log('[yuri2js] Unknown version.')
            }
        } else {
            console.log('[yuri2js] Unknown version.')
        }
        break;
    }
    default:
        console.log('[yuri2js] Unknown order.')
}

