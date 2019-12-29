/****************************************************************************
 Copyright (c) 2017-2019 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var fs = qg.accessFile ? qg : null;

function checkFsValid() {
    if (!fs) {
        console.warn('can not get the file system!');
        return new Error('file system does not exist!');
    }
    return null;
}

function deleteFile(filePath, callback) {
    var result = checkFsValid();
    if (result) return result;
    fs.deleteFile({
        uri: filePath,
        success: function () {
            cc.log('Removed local file ' + filePath + ' successfully!');
            callback && callback(null);
        },
        fail: function (res, code) {
            console.warn(`delete file fail, code = ${code}`);
            callback && callback(new Error(`delete file fail, code = ${code}`));
        }
    });
}

function downloadFile(remoteUrl, filePath, callback) {
    qg.download({
        url: remoteUrl,
        // filePath: filePath,
        success: function (res) {
            if (res.statusCode === 200) {

                if (typeof filePath === "undefined") {
                    callback && callback(null, res.tempFilePath);
                    return;
                }
                saveFile(res.tempFilePath, filePath, function (err, destPath) {
                    if (typeof destPath !== "undefined") {
                        callback && callback(null, destPath);
                    }
                });
            }
            else {
                if (res.tempFilePath) {
                    deleteFile(res.tempFilePath);
                }
                console.warn(`Download file failed: ${remoteUrl}`);
                callback && callback(new Error(`Download file failed: ${remoteUrl}`), null);
            }
        },
        fail: function (res, code) {
            console.warn(`Download file failed: ${remoteUrl},code: ${code}`);
            callback && callback(new Error(`Download file failed: ${remoteUrl},code: ${code}`), null);
        }
    });
}

function saveFile(srcPath, destPath, callback) {
    fs.moveFile({
        srcUri: srcPath,
        dstUri: destPath,
        success: function (res) {
            cc.log('save file finished:' + destPath);
            callback && callback(null, destPath);
        },
        fail: function (res, code) {
            cc.log(`move File fail, code = ${code}`);
            callback && callback(new Error(`move File fail, code = ${code}`), null);
        }
    });
}

function copyFile(srcPath, destPath, callback) {
    var result = checkFsValid();
    if (result) return result;
    fs.copyFile({
        srcUri: srcPath,
        dstUri: destPath,
        success: function () {
            cc.log('copy file finished:' + destPath);
            callback && callback(null);
        },
        fail: function (res, code) {
            cc.log(`copy file fail, code = ${code}`);
            callback && callback(new Error(`copy file fail, code = ${code}`));
        }
    });
}

function writeFile(path, data, encoding, callback) {
    var result = checkFsValid();
    if (result) return result;
    fs.writeFile({
        uri: path,
        encoding: encoding,
        text: data,
        success: callback ? function () {
            callback(null);
        } : undefined,
        fail: function (res, code) {
            console.warn(`write file fail, code = ${code}`);
            callback && callback(new Error(`write file fail, code = ${code}`));
        }
    });
}

function writeFileSync(path, data, encoding) {
    var result = checkFsValid();
    if (result) return result;
    const content = qg.writeFileSync({
        uri: path,
        text: data,
        encoding: encoding
    });

    if (content === 'success') {
        return null;
    }
    else {
        console.warn(`writeFileSync fail, result = ${content}`);
        return new Error(`writeFileSync fail, result = ${content}`);
    }

}

function readFile(filePath, encoding, callback) {
    var result = checkFsValid();
    if (result) return result;
    fs.readFile({
        uri: filePath,
        encoding: encoding,
        success: callback ? function (res) {
            callback(null, res.text);
        } : undefined,
        fail: function (res, code) {
            console.warn(`readFile fail, code = ${code}`);
            callback && callback(new Error(`readFile fail, code = ${code}`), null);
        }
    });
}

function readDir(filePath, callback) {
    var result = checkFsValid();
    if (result) {
        return result;
    }
    fs.listDir({
        uri: filePath,
        success: callback ? function (res) {
            var files = [];
            //取出路径
            for (const file of res.fileList) {
                files.push(file.uri.replace(filePath, ""));
            }
            callback(null, files);
        } : undefined,
        fail: callback ? function (res) {
            callback(new Error(res.errMsg), null);
        } : undefined
    });
}

function readText(filePath, callback) {
    return readFile(filePath, 'utf8', callback);
}

function readArrayBuffer(filePath, callback) {
    return readFile(filePath, 'binary', callback);
}

function readJsonSync(path) {
    var result = checkFsValid();
    if (result) return result;
    const content = qg.readFileSync({
        uri: path,
        encoding: 'utf8'
    })

    if (typeof content === 'string') {
        console.warn(`readFileSync fail, error message = ${content}`);
        return new Error(`readFileSync fail, error message = ${content}`);
    }
    else {
        return JSON.parse(content.text);
    }
}

function makeDir(path, callback) {
    var result = checkFsValid();
    if (result) return result;

    qg.mkdir({
        uri: path,
        success: function (uri) {
            callback(uri);
        },
        fail: function (data, code) {
            cc.warn(`mkdir fail, code = ${code}`)
            callback(undefined, `mkdir fail, code = ${code}`);

        }
    })
}

function exists(filePath, callback) {
    var result = checkFsValid();
    if (result) return result;
    var res = qg.accessFile({
        uri: filePath
    });

    if (callback === undefined) {
        return;
    }

    if (res === "true") {
        callback(true);
        return;
    }
    callback(false);
}

window.qgFsUtils = module.exports = { fs, checkFsValid, readDir, exists, copyFile, downloadFile, readText, readArrayBuffer, saveFile, writeFile, deleteFile, writeFileSync, readJsonSync, makeDir };