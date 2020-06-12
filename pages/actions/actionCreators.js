import actionTypes from './actionTypes'
export function change() { // 统一管理action
    return {
        type:  actionTypes.CHANGE
    }
}

export function setMsgUnreadCount(count) {
    return {
        type:actionTypes.SET_MSG_UNREAD_COUNT,
        msg_unread_count:count
    }
}
