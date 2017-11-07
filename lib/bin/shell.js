#! /usr/bin/env node
"use strict";
const yuri2js = require('../../yuri2');
let args = process.argv;

switch (args[2]) {
    case 'version': {
        console.log('[yuri2js] Version: ' + require('../version'));
        break;
    }
    default:
        console.log('[yuri2js] Unknown order.')
}

