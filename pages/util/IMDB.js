import SQLiteStorage from 'react-native-sqlite-storage';
import LogUtil from './LogUtil';
import StorageUtil from './StorageUtil';
import {DeviceEventEmitter} from 'react-native';
import Global from './Global';
import Log from 'react-native-fetch-blob/utils/log';

let DB_NAME;
const DB_VERSION = '1.0';
let DB_DISPLAY_NAME;
const DB_SIZE = -1;

const NOTIFY_MSG_TABLE_NAME = 'NOTIFY_MSG';
const IM_MSG = 'IM_MSG';
const USER_INFO = 'USER_INFO';
const DISTURB = 'DISTURB';

let db;
let loginData;

// 创建通知消息表 |id|消息类型type['invite_received','invite_accepted','invite_declined','contact_deleted']|消息内容|from|from_avatar|时间|是否已读
// 不要使用create table if not exists
const CREATE_IM_MSG_TABLE_SQL =
    'CREATE TABLE ' +
    IM_MSG +
    '(' +
    '`id` INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '`type` varchar(255) DEFAULT NULL,' +
    '`from_client_id` varchar(255) DEFAULT NULL,' +
    '`from_client_name` varchar(255) DEFAULT NULL,' +
    '`from_client_nickname` varchar(255) DEFAULT NULL,' +
    '`to_client_id` varchar(255) DEFAULT NULL,' +
    '`to_client_name` varchar(255) DEFAULT NULL,' +
    '`content` varchar(255) DEFAULT NULL,' +
    '`time` datetime DEFAULT NULL,' +
    '`tag` INTEGER NOT NULL DEFAULT 0,' +
    '`msg_type` varchar(255) DEFAULT \'text\'' +
    ');';

const CREATE_USER_INFO_TABLE_SQL = `CREATE TABLE ${USER_INFO} (ID INTEGER PRIMARY KEY,IS_LOGIN INTEGER DEFAULT 0,ACCESS_TOKEN varchar(255) DEFAULT NULL,REFRESH_TOKEN varchar(255) DEFAULT NULL,NAME varchar(255) DEFAULT NULL,SEX INTEGER DEFAULT NULL,STATE INTEGER DEFAULT NULL ,VIP_LEVEL INTEGER NOT NULL DEFAULT 0,VIP_START_TIME timestamp DEFAULT NULL,COIN int(11) NOT NULL DEFAULT 0);`;
// 数据库工具类
export default class IMDB {
    static init(data,callBack) {
        let uid = data['user_info']['id'];
        // 不同用户用不同的数据库
        DB_NAME = `qianyuanim-${uid}.db`;
        DB_DISPLAY_NAME = `QIANYUANIM-${uid}-DB`;
        LogUtil.w(`DB_NAME = ${DB_NAME}, DB_DISPLAY_NAME = ${DB_DISPLAY_NAME}`);
        IMDB.createImMsgTable();
        IMDB.createUserInfoTable(data,callBack);
        IMDB.createDisturbTable();
    }

    static hasLoginInit(uid) {
        DB_NAME = `qianyuanim-${uid}.db`;
        DB_DISPLAY_NAME = `QIANYUANIM-${uid}-DB`;
    }

    static open() {
        db = SQLiteStorage.openDatabase(
            DB_NAME,
            DB_VERSION,
            DB_DISPLAY_NAME,
            DB_SIZE,
            () => {
                LogUtil.d('open db success');
            },
            error => {
                LogUtil.e('open db fail: ' + error);
            },
        );
        return db;
    }

    static queryMsgUnreadCount(callBack,errorCallback){
        const sql = `select sum(tag) as count from ${IM_MSG}`;
        if (!db) {
            IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('query table IM_MSG unreadCount success: ', JSON.stringify(result));
                    let len = result.rows.length;
                    if (len) {
                        callBack(result.rows.item(0));
                    }
                    }, (error) => {
                    LogUtil.d('query table IM_MSG unreadCount fail: ', error.message);
                    errorCallback(error);
                });
            },
        );
    }


    // 创建表
    static createImMsgTable() {
        if (!db) {
            IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(CREATE_IM_MSG_TABLE_SQL, [], (tx, result) => {
                    LogUtil.d('create table IM_MSG success: ', JSON.stringify(result));
                }, (error) => {
                    LogUtil.d('create table IM_MSG fail: ', error.message);
                });
            },
        );
    }

    static createUserInfoTable(data,callBack) {
        if (!db) {
            IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(CREATE_USER_INFO_TABLE_SQL, [], (tx, result) => {
                    LogUtil.d('create table USER_INFO success: ', JSON.stringify(result));
                    let userInfo = data['user_info'];
                    if (userInfo['sex'] === null) {
                        IMDB.insertUserInfoRedister(data,callBack);
                    } else {
                        IMDB.insertUserInfo(data,callBack);
                    }
                }, (error) => {
                    LogUtil.d('create table USER_INFO fail: ', error.message);
                    let userInfo = data['user_info'];
                    if (userInfo['sex'] === null) {
                        IMDB.insertUserInfoRedister(data,callBack);
                    } else {
                        IMDB.insertUserInfo(data,callBack);
                    }
                });
            },
        );
    }

    // 创建表
    static createDisturbTable() {
        let CREATE_DISTURB_TABLE_SQL =
            'CREATE TABLE ' +
            DISTURB +
            '(' +
            '`id` INTEGER PRIMARY KEY AUTOINCREMENT,' +
            '`disturb_type` varchar(255),' +
            '`from_id` INTEGER,' +
            '`to_id` INTEGER' +
            ');';
        if (!db) {
            IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(CREATE_DISTURB_TABLE_SQL, [], (tx, result) => {
                    LogUtil.d('create table disturb success: ', JSON.stringify(result));
                }, (error) => {
                    LogUtil.d('create table disturb fail: ', error.message);
                });
            },
        );
    }

    static insertDisturb(data, callBack, errorCallback) {
        let from_id = data['from_id'];
        let to_id = data['to_id'];
        let disturb_type = data['disturb_type'];
        let sql = `insert into ${DISTURB} (from_id,to_id,disturb_type) values (${from_id},${to_id},'${disturb_type}')`;
        if (!db) {
            IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('insert into DISTURB success: ', JSON.stringify(result));
                    callBack(result);
                }, (error) => {
                    LogUtil.d('insert into DISTURB fail: ', error.message);
                    errorCallback(error);
                });
            },
        );
    }

    static delDisturb(data, callBack, errorCallback) {
        let from_id = data['from_id'];
        let to_id = data['to_id'];
        let disturb_type = data['disturb_type'];
        let sql = `delete from ${DISTURB} where from_id = ${from_id} and to_id = ${to_id} and disturb_type = '${disturb_type}';`;
        if (!db) {
            IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('delete from DISTURB success: ', JSON.stringify(result));
                    callBack(result);
                }, (error) => {
                    LogUtil.d('delete from DISTURB fail: ', error.message);
                    errorCallback(error);
                });
            },
        );
    }

    static insertUserInfo(data,callBack) {
        let userInfo = data['user_info'];
        let id = userInfo['id'];
        let state = userInfo['state'];
        let name = userInfo['name'];
        let sex = userInfo['sex'];
        let vip_level = userInfo['vip_level'];
        let vip_start_time = userInfo['vip_start_time'];
        let coin = userInfo['coin'];

        let access_token = data['access_token'];
        let refresh_token = data['refresh_token'];
        let sql = `insert into ${USER_INFO} (ID,IS_LOGIN,STATE,NAME,SEX,VIP_LEVEL,VIP_START_TIME,COIN,ACCESS_TOKEN,REFRESH_TOKEN) values (${id},1,${state},'${name}',${sex},${vip_level},'${vip_start_time}',${coin},'${access_token}','${refresh_token}');`;
        LogUtil.d('insert into USER_INFO sql:', sql);
        if (!db) {
            IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('insert into USER_INFO success: ', JSON.stringify(result));
                    StorageUtil.set('hasLogin', {hasLogin: true});
                    StorageUtil.set('uid', {uid: id});
                    //TODO::保存数据成功后，发送登录信号
                    DeviceEventEmitter.emit('appLogin', data);
                    callBack(result);
                }, (error) => {
                    LogUtil.d('insert into USER_INFO fail: ', error.message);
                });
            },
        );
    }

    static insertUserInfoRedister(data,callBack) {
        let userInfo = data['user_info'];
        let id = userInfo['id'];
        let state = userInfo['state'];
        let name = userInfo['name'];
        let access_token = data['access_token'];
        let refresh_token = data['refresh_token'];
        let sql = `insert into ${USER_INFO} (ID,IS_LOGIN,STATE,NAME,COIN,ACCESS_TOKEN,REFRESH_TOKEN) values (${id},1,${state},'${name}',0,'${access_token}','${refresh_token}');`;
        if (!db) {
            IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('insert into USER_INFO success: ', JSON.stringify(result));
                    StorageUtil.set('hasLogin', {hasLogin: true});
                    StorageUtil.set('uid', {uid: id});
                    //TODO::保存数据成功后，发送登录信号
                    DeviceEventEmitter.emit('appLogin', data);
                    callBack(result);
                }, (error) => {
                    LogUtil.d('insert into USER_INFO fail: ', error.message);
                });
            },
        );
    }

    static queryUserInfo(callBack) {
        let sql = `select * from ${USER_INFO} limit 1;`;
        if (!db) {
            IMDB.open();
        }

        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('query top 1 USER_INFO success: ', JSON.stringify(result));
                    if (result && result.rows) {
                        let len = result.rows.length;
                        let arr = [];
                        if (len) {
                            for (let i = 0; i < len; i++) {
                                LogUtil.d('query userinfo data row(' + i + '): ', JSON.stringify(result.rows.item(i)));
                                arr.push(result.rows.item(i));
                            }
                            callBack(arr);
                        }
                    }
                }, (error) => {
                    LogUtil.d('query top 1 USER_INFO fail: ', error.message);
                });
            },
        );
    }

    // 设置所有好友消息已读
    static setAllFriendMsgRead() {
        let sql = 'update ' + NOTIFY_MSG_TABLE_NAME + ' set has_read=1 where has_read=0';
        // LogUtil.w(sql);
        if (!db) {
            db = IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    // LogUtil.w('update success');
                }, (error) => {
                    LogUtil.d('update fail: ' + JSON.stringify(error));
                });
            },
        );
    }

    static insertHistoryMsg(data, callBack) {
        let type = data['type'];
        let from_client_id = data['from_client_id'];
        let from_client_name = data['from_client_name'];
        let from_client_nickname = data['from_client_nickname'];
        let to_client_id = data['to_client_id'];
        let to_client_name = data['to_client_name'];
        let content = data['content'];
        let time = data['time'];
        let tag = 0;
        /**
         * 保存发送消息时将传递data['tag']参数，
         * 这时候必须是0，
         * 如果没有传递该参数表示为接收参数，
         * 需要判断是否进入当前用户聊天窗口
         */
        if (data['tag'] !== 0) {
            tag = Global.currentChattingUsername === from_client_name ? 0 : 1;
        }
        let sql = `insert into ${IM_MSG} (type,from_client_id,from_client_name,from_client_nickname,to_client_id,to_client_name,content,time,tag) values ('${type}', '${from_client_id}', '${from_client_name}', '${from_client_nickname}', '${to_client_id}', '${to_client_name}',${content},'${time}',${tag})`;
        LogUtil.d('insert sql:', sql);
        if (!db) {
            db = IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('insert history data success', JSON.stringify(result));
                    callBack(result);
                }, (error) => {
                    LogUtil.d('insert history data fail: ', JSON.stringify(error));
                });
            },
        );
    }

    static insertUnreadMsg(list, callBack) {
        let sql = `insert into ${IM_MSG} (type,from_client_id,from_client_name,from_client_nickname,to_client_id,to_client_name,content,time,tag) values `;
        for (let i = 0; i < list.length; i++) {
            const data = list[i];
            let type = 'singleTalk';
            let from_client_id = data[2];
            let from_client_name = data[3];
            let from_client_nickname = data[4];
            let to_client_id = data[5];
            let to_client_name = data[6];
            let content = data[7];
            let time = data[8];
            let tag = Global.currentChattingUsername === from_client_name ? 0 : 1;
            if (i === list.length - 1) {
                sql += `('${type}', '${from_client_id}', '${from_client_name}', '${from_client_nickname}', '${to_client_id}', '${to_client_name}','${content}','${time}',${tag});`;
            } else {
                sql = sql + `('${type}', '${from_client_id}', '${from_client_name}', '${from_client_nickname}', '${to_client_id}', '${to_client_name}','${content}','${time}',${tag}),`;
            }
        }

        LogUtil.d('insert sql:', sql);
        if (!db) {
            db = IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('insert unread data success', JSON.stringify(result));
                    callBack(result);
                }, (error) => {
                    LogUtil.d('insert unread data fail: ', JSON.stringify(error));
                });
            },
        );
    }

    static updateUnreadCout(from_client_name, callBack, errorCallback) {
        let sql = `update ${IM_MSG} set tag = 0 where tag = 1 and from_client_name = ${from_client_name}`;
        if (!db) {
            db = IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('update unreadCount success: ', JSON.stringify(result));
                    callBack(result);
                }, (error) => {
                    LogUtil.d('update unreadCount fail: ', JSON.stringify(error));
                    errorCallback(error);
                });
            },
        );
    }

    /**
     * 先查对话列表
     * 再查最后一条对话记录
     * 再联合
     * @param callback
     */
    static queryChatHistory(callback) {
        let sql = `select * from ( select max(m.id),sum(m.tag) as unreadCount,* from ${IM_MSG} m left join ${DISTURB} d on m.from_client_name = d.to_id group by m.from_client_name) order by time desc`;
        if (!db) {
            db = IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('query data success: ', JSON.stringify(result));
                    if (result && result.rows) {
                        let len = result.rows.length;
                        let arr = [];
                        if (len) {
                            for (let i = 0; i < len; i++) {
                                LogUtil.d('query data row(' + i + '): ', JSON.stringify(result.rows.item(i)));
                                arr.push(result.rows.item(i));
                            }
                            callback(arr);
                        }
                    }
                }, (error) => {
                    LogUtil.d('query data fail: ', JSON.stringify(error));
                });
            },
        );
    }

    static queryMsgHistoryByFromClientName(from_client_name, callback) {
        let sql = `select * from ${IM_MSG} where from_client_name = ${from_client_name} order by time desc`;
        if (!db) {
            db = IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('query data success: ', JSON.stringify(result));
                    if (result && result.rows) {
                        let len = result.rows.length;
                        let arr = [];
                        if (len) {
                            for (let i = 0; i < len; i++) {
                                // LogUtil.d('query data row(' + i + '): ', JSON.stringify(result.rows.item(i)));
                                arr.push(result.rows.item(i));
                            }
                            callback(arr);
                        }
                    }
                }, (error) => {
                    LogUtil.d('query data fail: ', JSON.stringify(error));
                });
            },
        );
    }

    static reset() {
        let sql = `delete from ${USER_INFO};`;
        if (!db) {
            db = IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('delete from user_info success: ', JSON.stringify(result));
                }, (error) => {
                    LogUtil.d('delete from user_info fail: ' + JSON.stringify(error));
                });
            },
        );

        db = null;
    }

    static dropTable(username) {
        DB_NAME = `qianyuanim-${username}.db`;
        DB_DISPLAY_NAME = `QIANYUANIM-${username}-DB`;

        let sql = 'drop table ' + IM_MSG;
        if (!db) {
            db = IMDB.open();
        }
        db.transaction(
            tx => {
                tx.executeSql(sql, [], (tx, result) => {
                    LogUtil.d('drop table success: ', JSON.stringify(result));
                }, (error) => {
                    LogUtil.d('drop table fail: ' + JSON.stringify(error));
                });
            },
        );
    }
}
