const xml2js = require('xml2js');
module.exports = {
    jsonTostring(json) {
        return JSON.stringify(json);
    },
    stringToJson(string) {
        return JSON.parse(string);
    },

    xmlToJson(xml,autoRoot=true) {
        let rel={};
        xml2js.parseString(xml, {explicitArray : false},function (err,result) {
            if(!err){
                rel=result;
            }
        });
        if(autoRoot){
            rel=rel.root;
        }
        return rel;
    },

    jsonToXml(json,autoRoot=true) {
        if(autoRoot){
            json={root:json};
        }
        let builder = new xml2js.Builder({headless: true});  // JSON->xml
        return builder.buildObject(json)
    },

    dateFormat(date,format){
        if(!date){
            date=new Date()
        }
        if (!format) {
            format = 'yyyy-MM-dd hh:mm:ss';
        }
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return format;
    },
    htmlspecialchars: function (str) {
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/'/g, '&#039;');
        return str;
    },
    htmlspecialchars_decode: function (str) {
        str = str.replace(/&amp;/g, '&');
        str = str.replace(/&lt;/g, '<');
        str = str.replace(/&gt;/g, '>');
        str = str.replace(/&quot;/g, "''");
        str = str.replace(/&#039;/g, "'");
        return str;
    },
    textOverFlow: function (str, len) {
        return str.length > len ? str.substring(0, len) + "..." : str;
    },
}