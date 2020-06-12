import actionTypes from '../actions/actionTypes'
const defaultState = { // 初始化state
    data: 0,
    msg_unread_count:0
};

export default (state = defaultState, action) => {
    console.log(action);
    if (action.type === actionTypes.CHANGE) { // 修改state
        const newState = JSON.parse(JSON.stringify(state));
        newState.data = 11;
        return newState
    }
    else if(action.type === actionTypes.SET_MSG_UNREAD_COUNT){
        const newState = JSON.parse(JSON.stringify(state));
        newState.msg_unread_count = action.msg_unread_count;
        return newState
    }
    return state
}
