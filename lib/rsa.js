const ursa = require('ursa-purejs');
module.exports = {
    /**
     * @param bits int 字节数
     * @param exp int
     * @return object
     * */
    getKeyPair: function (bits = 512, exp = 65537) {
        let rel = {};
        let keys = ursa.generatePrivateKey(bits, exp);
        rel.public = keys.toPublicPem();
        rel.private = keys.toPrivatePem();
        return rel;
    },

    encrypt(buf, key) {
        try {
            let pub = ursa.createPublicKey(key);
            return pub.encrypt(buf);
        } catch (e) {
            return false;
        }
    },

    decrypt(buf, key) {
        try {
            let pri = ursa.createPrivateKey(key);
            return pri.decrypt(buf);
        } catch (e) {
            return false;
        }
    },

};