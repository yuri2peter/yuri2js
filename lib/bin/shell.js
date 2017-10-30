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
        console.log('[yuri2js] Version: ' + require('../version'));
        break;
    }
    default:
        console.log('[yuri2js] Unknown order.')
}

