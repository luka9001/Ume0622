const serverConfig = {
    env: "prod", //dev:开发环境，prod:生成环境
    // host: "http://58.211.183.34:30080",
    host: "http://192.168.5.127:8000",
    version: "v1.0",
    header: {"Accept": "application/json", "content-type": "application/json"},
    // header_multipart: {
    //   'Content-Type': 'multipart/form-data;charset=utf-8',
    //   "Authorization": access_token,
    // },
    jMessageAccountHeader: 'qy_',
    access_token: 'none',
    refresh_token: 'none',
    lifephotos: '',
    name: '',
    sex: '',
    state: '',
    schoolData: [{label: '初中', value: '初中'}, {label: '高中', value: '高中'}, {label: '本科', value: '本科'}, {
        label: '硕士',
        value: '硕士'
    }, {label: '博士', value: '博士'}],
    marryStatusData: [{label: '未婚', value: '未婚'}, {label: '离异(没孩子)', value: '离异(没孩子)'}, {
        label: '离异(孩子跟我)',
        value: '离异(孩子跟我)'
    }, {label: '离异(孩子不跟我)', value: '离异(孩子不跟我)'}],
    smokeData: [{label: '不抽烟', value: '不抽烟'}, {label: '偶尔抽烟', value: '偶尔抽烟'}, {
        label: '经常抽烟',
        value: '经常抽烟'
    }, {label: '正在戒烟', value: '正在戒烟'}],
    drinkData: [{label: '不喝酒', value: '不喝酒'}, {label: '偶尔喝酒', value: '偶尔喝酒'}, {
        label: '经常喝酒',
        value: '经常喝酒'
    }, {label: '正在戒酒', value: '正在戒酒'}],
    babyData: [{label: '不想要', value: '不想要'}, {label: '一个', value: '一个'}, {label: '两个', value: '两个'}, {
        label: '两个以上',
        value: '两个以上'
    }],
    inComeData: [{label: '1000€以下', value: '1000€以下'}, {label: '1000€至2000€', value: '1000€至2000€'}, {
        label: '2000€以上',
        value: '2000€以上'
    }],
    carData: [{label: '有车', value: '有车'}, {label: '无车', value: '无车'}],
    houseData: [{label: '有房产', value: '有房产'}, {label: '无房产', value: '无房产'}],
    languageData: [{label: '普通话', value: '普通话'}, {label: '粤语', value: '粤语'}, {label: '英语', value: '英语'}, {
        label: '日语',
        value: '日语'
    }, {label: '韩语', value: '韩语'}, {label: '法语', value: '法语'}, {label: '德语', value: '德语'}, {
        label: '意大利语',
        value: '意大利语'
    }, {label: '西班牙语', value: '西班牙语'}, {label: '其他', value: '其他'}],
    religion: [{label: '基督教/其他', value: '基督教/其他'}, {label: '基督教/天主教', value: '基督教/天主教'}, {
        label: '基督教/新教徒',
        value: '基督教/新教徒'
    }, {label: '佛教', value: '佛教'}, {label: '道教', value: '道教'}, {label: '不可知论者', value: '不可知论者'}, {
        label: '无神论者',
        value: '无神论者'
    }, {label: '穆斯林/伊斯兰教', value: '穆斯林/伊斯兰教'}],
    matchMakerItems: [{label: '线下约见', value: '线下约见'}, {label: '联系不到对方', value: '联系不到对方'}, {
        label: '了解TA的详细信息',
        value: '了解TA的详细信息'
    }, {label: '送TA署名鲜花', value: '送TA署名鲜花'},{label: '送TA署名蛋糕', value: '送TA署名蛋糕'},{label: '其他', value: '其他'}],
    coutryCode: [{label: '西班牙(+34)', value: '西班牙(+34)'}, {label: '意大利(+39)', value: '意大利(+39)'}, {
        label: '法国(+33)',
        value: '法国(+33)'
    }, {label: '其他(+)', value: '其他(+)'}]
};
export default serverConfig;
