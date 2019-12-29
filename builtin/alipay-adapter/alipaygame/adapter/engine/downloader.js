let loadedSubPackages = {};

cc.loader.downloader.loadSubpackage = function (name, completeCallback) {
    // Not support for now on Alipay platform
    if (loadedSubPackages[name] !== true) {
        require(`../../subpackages/${name}/index.js`);
        loadedSubPackages[name] = true;
    }
    completeCallback && completeCallback();
};

function downloadScript (item, callback, isAsync) {
    var url = '../../' + item.url;
    require(url);
    callback(null, item.url);
}

function loadImage(item) {
    var loadByDeserializedAsset = item._owner instanceof cc.Asset;
    if (loadByDeserializedAsset) {
        // already has cc.Asset
        return null;
    }

    var image = item.content;

    // load cc.Texture2D
    var rawUrl = item.rawUrl;
    var tex = item.texture || new cc.Texture2D();
    tex._uuid = item.uuid;
    tex.url = rawUrl;
    tex._setRawAsset(rawUrl, false);
    tex._nativeAsset = image;
    return tex;
}

function loadFont (item) {
    // var url = item.url;
    // var fontFamily = my.loadFont(url);
    // return fontFamily || 'Arial';

    // loadFont not supported on Alipay
    return 'Arial';
}

cc.loader.downloader.addHandlers({
    js : downloadScript
});

cc.loader.loader.addHandlers({
    // Images
    png: loadImage,
    jpg: loadImage,
    bmp: loadImage,
    jpeg: loadImage,
    gif: loadImage,
    ico: loadImage,
    tiff: loadImage,
    webp: loadImage,
    image: loadImage,

    // Font
    font: loadFont,
    eot: loadFont,
    ttf: loadFont,
    woff: loadFont,
    svg: loadFont,
    ttc: loadFont,
});
