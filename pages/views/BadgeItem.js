import {Badge} from 'react-native-elements';
import React from 'react';

export const BadgeItem = (unreadCount) => {
    if (unreadCount > 99) {
        return <Badge
            status="error"
            value="99+"
            containerStyle={{position: 'absolute', top: -4, right: -4}}
        />;
    } else if (unreadCount > 0) {
        return <Badge
            status="error"
            value={unreadCount}
            containerStyle={{position: 'absolute', top: -4, right: -4}}
        />;
    } else if(unreadCount === -1){
        return <Badge
            status="error"
            containerStyle={{position: 'absolute', top: -4, right: -4}}
        />;
    }
    else {
        return null;
    }
};
