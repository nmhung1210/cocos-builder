let path = require('path');
let fs = require('fs-extra');

let resPath = path.join(__dirname, "../", "res");
let cpk;

let dirName = "jsb-adapter";
let buildPath;
let srcPath = path.join(resPath, dirName);
let destPath;   // 目标路径
let isTinyPackage = false;  // 是否是小包模式
let tinyPackageServer = "";
let serverDir;
let isPackFirstScreenRes;
let buildResults;
let startScene;


module.exports = {
    /**
     * 收集信息
     * @param info 打包信息
     */
    gatherInfo(info) {
        cpk = info.cpk;
        isTinyPackage = !!info.customConfig.tinyPackageMode;
        isPackFirstScreenRes = !!info.customConfig.packFirstScreenRes;
        buildPath = info.buildPath;
        buildResults = info.buildResults;
        startScene = info.startScene;
        serverDir = path.join(buildPath, "server");

    },
    /**
     * 整理资源
     */
    async organizeResources() {

    },
    /**
     * 打包
     */
    pack() {

        if (isTinyPackage === false) {
            cpk.directory(path.join(buildPath, "res"), "res");  // 添加res文件夹到cpk
            return;
        }

        if (isPackFirstScreenRes === false) {
            return;
        }

        //先把raw-assets资源存到另一个目录server
        let serverRawAssertDir = path.join(serverDir, "res", "raw-assets");
        let originRawAssertDir = path.join(buildPath, "res", "raw-assets");
        fs.moveSync(originRawAssertDir, serverRawAssertDir);
        fs.removeSync(originRawAssertDir);

        //添加 首屏的 res/import 的资源

        var depends = buildResults.getDependencies(startScene);
        for (var i = 0; i < depends.length; ++i) {
            var uuid = depends[i];
            // 获得构建后的资源路径（资源有图片、音频等，如果不是资源将返回空）
            var nativePath = buildResults.getNativeAssetPath(uuid);
            if (!nativePath || nativePath.length === 0) {
                continue;
            }
            let serverPath = path.join(serverDir, nativePath.replace(buildPath, ""));
            fs.moveSync(serverPath, nativePath);
            //删除空目录
            var fileDir = path.dirname(serverPath);
            if (this.isEmptyDir(fileDir)) {
                fs.removeSync(fileDir);
            }
        }

        cpk.directory(path.join(buildPath, "res"), "res");  // 添加res文件夹到cpk
    },

    isEmptyDir(fPath) {
        var pa = fs.readdirSync(fPath);
        return pa.length === 0;
    },

    packFinished() {
        if (isTinyPackage === false || isPackFirstScreenRes === false) {
            return;
        }
        fs.removeSync(path.join(buildPath, "res"));
        fs.moveSync(path.join(serverDir, "res"), path.join(buildPath, "res"));
        fs.removeSync(serverDir);
    }
};