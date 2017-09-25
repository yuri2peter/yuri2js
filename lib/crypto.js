//加密 模块
const crypto = require('crypto');

module.exports={
    encrypt(str, secret){
        let cipher = crypto.createCipher('aes192', secret);
        let enc = cipher.update(str, 'utf8','hex' );
        enc += cipher.final('hex');
        return enc;
    },
    /**
     * @return string|false 解密，失败返回false
     * */
    decrypt(str, secret){
        try{
            let decipher = crypto.createDecipher('aes192', secret);
            let dec = decipher.update(str, 'hex', 'utf8');
            dec += decipher.final('utf8');
            return dec;
        }catch (e){
            return false;
        }

    },
    md5(str){
        let md5sum = crypto.createHash('md5');
        md5sum.update(str, 'utf-8');
        str = md5sum.digest('hex');
        return str;
    },
    randomString(size){
        size = size || 6;
        let code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let max_num = code_string.length + 1;
        let new_pass ='';
        while (size > 0) {
            new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
            size--;
        }
        return new_pass;
    }
};