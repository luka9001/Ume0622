import moment from 'moment';
// 根据时间戳格式化时间为**分钟前，**天前这种格式
function getFormattedTime(timestamp) {
    timestamp = timestamp.substring(0, 19);
    timestamp = timestamp.replace(/-/g, '/');
    timestamp = Date.parse(new Date(timestamp)) / 1000;
    let curTime = Date.parse(new Date()) / 1000;
    let delta = curTime - timestamp;
    const hour = 60 * 60;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 12 * month;
    if (delta < hour) {
        // 显示多少分钟前
        let n = parseInt(delta / 60);
        if (n === 0) {
            return '刚刚';
        }
        return n + '分钟前';
    } else if (delta >= hour && delta < day) {
        return parseInt(delta / hour) + '小时前';
    } else if (delta >= day && delta < month) {
        return parseInt(delta / day) + '天前';
    } else if (delta >= month && delta < year) {
        return parseInt(delta / month) + '个月前';
    }
}

function format(date, fmt) {
    var o = {
        'M+': date.getMonth() + 1,                 //月份
        'd+': date.getDate(),                    //日
        'h+': date.getHours(),                   //小时
        'm+': date.getMinutes(),                 //分
        's+': date.getSeconds(),                 //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        'S': date.getMilliseconds(),             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
}

function formatChatTime(timestamp) {
    let today = getDateToday();
    let messageDate = format(new Date(timestamp * 1000), 'MM月dd日 hh:mm');
    if (messageDate.indexOf(today) === -1) {
        return messageDate;
    } else {
        return format(new Date(timestamp * 1000), 'hh:mm');
    }
}

function formatWebSocketMessageTime(timeStr) {
    let date = moment(Date.now());
    let day = date.format('YYYY年MM月DD日');
    let year = date.format('YYYY年');
    let messageDate = moment(timeStr).format('YYYY年MM月DD日 hh:mm');
    if(messageDate.indexOf(day) !== -1){
        return moment(timeStr).format('hh:mm');
    }
    else if(messageDate.indexOf(year) !== -1){
        return moment(timeStr).format('MM月DD日 hh:mm');
    }
    else{
        return messageDate;
    }
}


function getDateToday() {
    let date = new Date();

    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();

    return month + '月' + day + '日';
}

function getDateTodayStr() {
    let date = new Date();

    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();

    return month + '-' + day;
}

function currentTime() {
    return Date.parse(new Date()) / 1000;
}

module.exports = {
    getFormattedTime: getFormattedTime,
    formatChatTime: formatChatTime,
    formatWebSocketMessageTime: formatWebSocketMessageTime,
    currentTime: currentTime,
};
