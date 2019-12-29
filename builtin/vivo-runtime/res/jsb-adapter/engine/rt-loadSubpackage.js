let isGetSystemInfo = false;
var qgEngineVersion;

cc.loader.downloader.loadSubpackage = function (name, completeCallback) {
    if (qg === undefined) {
        return;
    }

    if (isGetSystemInfo === false) {
        qg.getSystemInfo({
            success: function (res) {
                qgEngineVersion = res.platformVersionCode;
                isGetSystemInfo = true;
                loadByVersion(name, completeCallback);
            }
        })
        return;
    }
    loadByVersion(name, completeCallback);
};

function loadByVersion(name, completeCallback) {
    if (qgEngineVersion >= 1051) {
        loadSubpackage(name, completeCallback);
        return;
    }
    //兼容版本：低于 1051 引擎加载的是总包，总包的 game.js 已require了分包的game.js，并且资源也在总包里。直接返回成功即可
    if (completeCallback) completeCallback();
}

function loadSubpackage(name, completeCallback) {
    qg.loadSubpackage({
        name: name,
        success: function () {
            if (completeCallback) completeCallback();
        },
        fail: function () {
            if (completeCallback) completeCallback(new Error(`Failed to load subpackage ${name}`));
        }
    })
}

if (cc.Pipeline.SubPackPipe && cc.Pipeline.SubPackPipe.prototype && cc.Pipeline.SubPackPipe.prototype.transformURL) {
    let _tempTransformUrl = cc.Pipeline.SubPackPipe.prototype.transformURL;
    cc.Pipeline.SubPackPipe.prototype.transformURL = function (url) {
        var url = _tempTransformUrl(url);
        return url.replace("subpackages/", "");
    };
}