import React from 'react';
import {Platform, CameraRoll} from 'react-native';
import RNFS from 'react-native-fs';
import {Toast} from '@ant-design/react-native';

/**
 * @return {null}
 */
export function Download(uri) {
    if (!uri) return null;
    if (Platform.OS === 'ios') {
        return new Promise((resolve, reject)=>{
            let promise = CameraRoll.saveToCameraRoll(uri);
            promise.then(function (result) {
                resolve(result);
            }).catch(function (error) {
                reject(error);
            })
        });
    } else {
        return new Promise((resolve, reject) => {
            let dirs = Platform.OS === 'ios' ? RNFS.LibraryDirectoryPath : RNFS.ExternalDirectoryPath; //外部文件，共享目录的绝对路径（仅限android）
            const downloadDest = `${dirs}/${((Math.random() * 10000000) | 0)}.jpg`;
            const formUrl = uri;
            const options = {
                fromUrl: formUrl,
                toFile: downloadDest,
                background: true,
                begin: (res) => {
                    console.log('begin', res);
                    console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
                },
            };
            try {
                const ret = RNFS.downloadFile(options);
                ret.promise.then(res => {
                    console.log('success', res + '开始保存');
                    console.log('file://' + downloadDest);
                    let promise = CameraRoll.saveToCameraRoll(downloadDest);
                    promise.then(function (result) {
                        alert('保存成功！地址如下：\n' + result);
                    }).catch(function (error) {
                        console.log('error', error);
                        alert('保存失败！\n' + error);
                    });
                    resolve(res);
                }).catch(err => {
                    reject(new Error(err))
                });
            } catch (e) {
                reject(new Error(e))
            }
        })
    }
}