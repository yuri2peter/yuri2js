const xml2js = require('xml2js');
const querystring = require('querystring');
const urlencode = require('urlencode');
module.exports = {
    jsonToString(json) {
        return JSON.stringify(json);
    },
    stringToJson(string) {
        return JSON.parse(string);
    },

    xmlToJson(xml, autoRoot = true) {
        let rel = {};
        xml2js.parseString(xml, {explicitArray: false}, function (err, result) {
            if (!err) {
                rel = result;
            }
        });
        if (autoRoot) {
            rel = rel.root;
        }
        return rel;
    },

    jsonToXml(json, autoRoot = true) {
        if (autoRoot) {
            json = {root: json};
        }
        let builder = new xml2js.Builder({headless: true});  // JSON->xml
        return builder.buildObject(json)
    },

    dateFormat(date, format) {
        if (!date) {
            date = new Date()
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
    msToTime(mss) {
        let days = parseInt(mss / (1000 * 60 * 60 * 24));
        let hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = parseInt((mss % (1000 * 60)) / 1000);
        return {
            days:days,
            hours:hours,
            minutes:minutes,
            seconds:seconds,
        }
    },
    htmlSpecialCharsEncode(str) {
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/'/g, '&#039;');
        return str;
    },
    htmlSpecialCharsDecode(str) {
        str = str.replace(/&amp;/g, '&');
        str = str.replace(/&lt;/g, '<');
        str = str.replace(/&gt;/g, '>');
        str = str.replace(/&quot;/g, "''");
        str = str.replace(/&#039;/g, "'");
        return str;
    },
    textOverFlow(str, len) {
        return str.length > len ? str.substring(0, len) + "..." : str;
    },
    jsonToQuery(json) {
        return querystring.stringify(json)
    },
    queryToJson(str) {
        let json = querystring.parse(str);
        const preg = /^(\w+)\[]$/; //识别[]的正则
        let fields = {};
        for (let i in json) {
            let value = json[i];
            let matches = i.match(preg);
            if (matches) {
                fields[matches[1]] = Array.isArray(value) ? value : [value];
            } else {
                fields[i] = Array.isArray(value) ? value.pop() : value;
            }
        }
        return fields;
    },
    jsonToQuery(json) {
        let jsonNew = {};
        for (let i in json) {
            let value = json[i];
            if (Array.isArray(value)) {
                jsonNew[i + '[]'] = value
            } else {
                jsonNew[i] = value;
            }
        }
        return querystring.stringify(jsonNew);
    },
    urlEncode(str, charset = 'utf8') {
        return urlencode(str, charset);
    },
    urlDecode(str, charset = 'utf8') {
        return urlencode.decode(str, charset)
    },
};