require('./adapter/my-builtin');
var Parser = require('./adapter/xmldom/dom-parser');
window.DOMParser = Parser.DOMParser;
require('./adapter/engine/Platform');
require('./adapter/my-downloader');
require('./src/settings');
require('./main');
require(window._CCSettings.debug ? './cocos2d-js' : './cocos2d-js-min');
require('./adapter/engine/index');

// Adjust devicePixelRatio
cc.view._maxPixelRatio = 4;

myDownloader.REMOTE_SERVER_ROOT = "";
myDownloader.SUBCONTEXT_ROOT = "";
var pipeBeforeDownloader = cc.loader.subPackPipe || cc.loader.md5Pipe || cc.loader.assetLoader;
cc.loader.insertPipeAfter(pipeBeforeDownloader, myDownloader);

// Release Image objects after uploaded gl texture
cc.macro.CLEANUP_IMAGE_CACHE = true;

myDownloader.init();
window.boot();