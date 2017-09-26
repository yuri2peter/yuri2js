const fs = require('fs');
const sysPath = require('path');
const Path = require("path");

module.exports = {

    /** 同步，创建多级目录
     * @return bool success/failed */
    mkdir(path, mode = 0o777) {
        let yuri2 = require('../yuri2');
        let dir = yuri2.strReplaceAll(sysPath.resolve(path), '\\', '/');
        let split = '/';
        let paths = dir.split(split);
        let pathNow = '';
        for (let i = 0; i < paths.length; i++) {
            pathNow += paths[i] + '/';
            if (!this.isDir(pathNow)) {
                fs.mkdirSync(pathNow, mode);
            }
        }
        return this.isDir(dir);
    },

    isFile(path) {
        return fs.existsSync(path) && fs.statSync(path).isFile();
    },

    isDir(path) {
        return fs.existsSync(path) && fs.statSync(path).isDirectory();
    },

    filePutContent(filename, content) {
        let dir = sysPath.resolve(filename, '..');
        this.isDir(dir) || this.mkdir(dir);
        fs.writeFileSync(filename, content);
    },

    /**@return Buffer */
    fileGetContent(filename) {
        if (!this.isFile(filename)) {
            return false;
        } else {
            return fs.readFileSync(filename);
        }
    },

    /** @return bool */
    deleteDir(path) {
        let that=this;
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                let curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    that.deleteDir(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
        return !this.isDir(path)
    },

    getExt(path){
        return Path.extname(path);
    }

};