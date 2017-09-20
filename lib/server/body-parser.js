let querystring = require("querystring");
let formidable = require("formidable");

module.exports = class {
    constructor(ctx) {
        this.ctx = ctx;
        this.yuri2 = require('../../yuri2');
    }

    async parse(options) {
        let defaultOptions = {
            type: 'form',
            encoding: 'utf8',
            maxsize:4 * 1024 * 1024,
        };
        options = this.yuri2.jsonMerge(defaultOptions, options);
        let req = this.ctx.$req;
        let rel = {
            err: null
        };
        switch (options.type) {
            case 'raw': {
                await this._receiveData(req,options).then(function (result) {
                    rel.result =result;
                }).catch(function (err) {
                    rel.err=err.toString();
                    rel.result=new Buffer('');
                });
                break;
            }
            case 'text': {
                await this._receiveData(req,options).then(function (result) {
                    rel.result =result.toString(options.encoding);
                }).catch(function (err) {
                    rel.err=err.toString();
                    rel.result='';
                });
                break;
            }
            case 'form': {
                await this._receiveData(req,options).then(function (result) {
                    let query = result.toString(options.encoding);
                    rel.result = this.yuri2.yuri2Format.queryToJson(query);
                }).catch(function (err) {
                    rel.err=err.toString();
                    rel.result={};
                });

                break;
            }
            case 'json': {
                await this._receiveData(req,options).then(function (result) {
                    let query = result.toString(options.encoding);
                    rel.result = this.yuri2.yuri2Format.stringToJson(query);
                }).catch(function (err) {
                    rel.err=err.toString();
                    rel.result={};
                });
                break;
            }
            case 'multipart':{
                let form = new formidable.IncomingForm();
                await new Promise(function(resolve, reject) {
                    let fields={};
                    let files={};
                    let fileSizeCount=0;
                    const preg=/^(\w+)\[]$/; //识别[]的正则
                    form.maxFieldsSize=options.maxsize;
                    form.parse(req, function(err, fields, files) {});
                    form.on('field', function(name, value) {
                        let matches=name.match(preg);
                        if(matches){
                            if(!fields[matches[1]]){
                                fields[matches[1]]=[];
                            }
                            fields[matches[1]].push(value);
                        }else{
                            fields[name]=value;
                        }
                    });
                    form.on('file', function(name, file) {
                        fileSizeCount+=file.size;
                        if(fileSizeCount>options.maxsize){
                            reject(new Error(`Form maxsize(${options.maxsize/1024} kb) reached.`))
                        }
                        let matches=name.match(preg);
                        if(matches){
                            if(!files[matches[1]]){
                                files[matches[1]]=[];
                            }
                            files[matches[1]].push(file);
                        }else{
                            files[name]=file;
                        }
                    });
                    form.on('error', function(err) {
                        reject(err)
                    });
                    form.on('end', function() {
                        resolve({
                            fields:fields,
                            files:files,
                        });
                    });
                })
                    .then(function (data) {
                    rel.result=data
                }).catch(function (err) {
                        rel.err=err.toString();
                        rel.result={
                            fields:{},
                            files:{},
                        };
                    });
                break;
            }
        }
        return rel;
    }

    /**
     * @return Buffer */
    async _receiveData  (req,options) {
        return new Promise((resolve, reject) => {
            let chunks = [];
            let size=0;
            req.on('data', function (chunk) {
                size+=chunk.length;
                if(size>options.maxsize){
                    reject(new Error(`Form maxsize(${options.maxsize/1024} kb) reached.`))
                }
                chunks.push(chunk);
            });
            req.on('end', function () {
                try {
                    resolve(Buffer.concat(chunks))
                } catch (ex) {
                    reject(ex)
                }
            });
        });
    };
};