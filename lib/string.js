const crypto=require('crypto');
module.exports = {
    searchSubStr(str, subStr) {
        let positions=[];
        let pos = str.indexOf(subStr);
        while (pos > -1) {
            positions.push(pos);
            pos = str.indexOf(subStr, pos + 1);
        }
        return positions;
    },
    randomString(size){
        size = size || 6;
        let code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let max_num = code_string.length;
        let new_pass ='';
        while (size > 0) {
            new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
            size--;
        }
        return new_pass;
    },
    md5(str){
        let md5sum = crypto.createHash('md5');
        md5sum.update(str, 'utf-8');
        str = md5sum.digest('hex');
        return str;
    },
    isStartWith(str,needle){
        return str.indexOf(needle)===0;
    },
};