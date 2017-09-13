module.exports = {
    unique(arr) {
        var newArray = [];
        var oldArray = arr;
        if (oldArray.length <= 1) {
            return oldArray;
        }
        for (var i = 0; oldArray.length > 0; i++) {
            //要一直把oldArray pop完为止.所以长度会一直变短。所以不能用i < oldArray.length的形式来判断是否完成.
            newArray.push(oldArray.shift()); //oldArray从最前面开始移出数组元素，这样新数组的顺序不会变。
            for (var j = 0; j < oldArray.length; j++) {
                if (newArray[i] === oldArray[j]) {
                    oldArray.splice(j, 1);//删除重复的元素
                    j--;
                }
            }
        }
        return newArray;
    },

    inArray(needle, arrayToSearch) {
        for (s = 0; s < arrayToSearch.length; s++) {
            thisEntry = arrayToSearch[s].toString();
            if (thisEntry === needle) {
                return true;
            }
        }
        return false;
    },

    //打乱数组
    shuffle: function (arr) {
        var i,
            j,
            temp;
        for (i = arr.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    },
}