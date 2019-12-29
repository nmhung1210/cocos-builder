var WEBPACK_NAME = "minigame.config.js";
var MAIN_JS_NAME = "game.js";
var GAME_CONFIG_JSONS_NAME = "manifest.json";
var QGAME_ADAPTER_NAME = "qgame-adapter.js";

var path = require('path');
var fs = require('fire-fs');

var zipRootPath;
let RUNTIME_CONFIG;

var SRC_NAME = "src";
var ENGINE_NAME = "engine";
var SIGN_NAME = "sign";

// 导出的 vivo小游戏 根目录
var dirTarget;
// cp配置的应用图标路径
var iconPath;
// 写入manifest.json的应用图标的路径

var VIVOExternals = "";
var privatePath;
var certificatePath;
var useDebugKey;
var sendStatisticsDebug;
var sendStatisticsSourceMaps;
var showNpmPath;
var cliPackTool = require(Editor.url('packages://vivo-runtime/lib/cli'));

// 获取资源文件
function getResPath(name) {
    var resPath = path.join(__dirname, "res");
    return path.join(resPath, name);
}

// 添加不需要编译的js
function handleExternalFile(dir, rootPath) {
    var list = fs.readdirSync(dir);

    list.forEach(function (filePath) {
        var fullPath = path.join(dir, filePath);
        var stat = fs.statSync(fullPath);

        if (stat && stat.isDirectory()) {
            handleExternalFile(fullPath, rootPath);
        } else {
            var fileExt = path.extname(fullPath);
            if (fileExt === ".js") {
                var relativeToZipPath = fullPath.slice(rootPath.length + 1, fullPath.length);

                // 去除 main.js 以及 jsb-adapter 下除了 index.js 的文件
                if (relativeToZipPath !== "main.js" &&
                    (relativeToZipPath.indexOf("jsb-adapter") !== 0 || filePath === "index.js" || filePath === "rename-adapter.js")) {

                    // 替换 \\ 为 /
                    relativeToZipPath = relativeToZipPath.replace(/\\/g, '/');
                    var element = {};
                    element['module_name'] = relativeToZipPath.replace('engine/', '');
                    element['module_path'] = relativeToZipPath.replace('engine/', '');
                    element['module_from'] = relativeToZipPath;
                    VIVOExternals += JSON.stringify(element) + ",\n";
                }
            }
        }
    });
}

function zipVIVOExternals() {
    var webpackName = WEBPACK_NAME;
    var webpackSource = getResPath(webpackName);
    var webpackContent = fs.readFileSync(webpackSource, "utf8");
    webpackContent = webpackContent.replace("EXTERNALS_PLACEHOLDER", VIVOExternals);
    // 在游戏工程的config目录里添加webpack.config.js
    fs.writeFileSync(path.join(dirTarget, WEBPACK_NAME), webpackContent);
}

function writeConfigFile(options) {
    var cfgName = 'game.config.json';
    var projectPath = Editor.Project.path;
    if (typeof projectPath === 'undefined') {
        projectPath = Editor.projectPath;
    }
    var projectCgfFile = path.join(projectPath, cfgName);
    var package = RUNTIME_CONFIG.package;
    var name = RUNTIME_CONFIG.name;
    var versionName = RUNTIME_CONFIG.versionName;
    var versionCode = RUNTIME_CONFIG.versionCode;
    var minPlatformVersion = RUNTIME_CONFIG.minPlatformVersion;
    var deviceOrientation = RUNTIME_CONFIG.deviceOrientation;
    var logLevel = RUNTIME_CONFIG.logLevel;

    var jsonObj = {
        "package": package,
        "name": name,
        "icon": `/image/${path.parse(iconPath).base}`,
        "versionName": versionName,
        "versionCode": versionCode,
        "minPlatformVersion": minPlatformVersion,
        "deviceOrientation": deviceOrientation,
        "type": "game",
        "config": {
            "logLevel": logLevel
        },
        "display": {
        }
    };
    let subPackageData = getSubPackData(options);
    if (subPackageData !== undefined) {
        jsonObj.subpackages = subPackageData;
    }
    var jsonStr = JSON.stringify(jsonObj);
    fs.writeFileSync(projectCgfFile, jsonStr);
}

function handleSrc() {
    var mainName = 'main.js';
    var fileMain = path.join(zipRootPath, mainName);
    var mainString = fs.readFileSync(fileMain, "utf8");

    mainString = mainString.replace('window.jsb', 'window.qg');

    var index = mainString.indexOf("require('src/settings");

    mainString = mainString.slice(0, index) + "require('jsb-adapter/engine/rename-adapter.js');\n\t\trequire('src/qgame-adapter.js');\n\t\t" + mainString.slice(index);
    mainString = mainString.replace("require('jsb-adapter/jsb-engine.js');", "require('jsb-adapter/engine/index.js');");
    mainString = mainString.replace("var isRuntime = (typeof loadRuntime === 'function');", '');
    mainString = mainString.replace('if (isRuntime)', 'if (true)');
    fs.writeFileSync(fileMain, mainString);

    // 导出的 vivo小游戏 src目录
    var srcTarget = path.join(dirTarget, SRC_NAME);
    // 如果src目录存在，则先删除再创建目录
    fs.emptyDirSync(srcTarget);
    // 添加game.js
    fs.writeFileSync(path.join(srcTarget, MAIN_JS_NAME), mainString);

    var cfgName = 'game.config.json';
    var projectPath = Editor.Project.path;
    if (typeof projectPath === 'undefined') {
        projectPath = Editor.projectPath;
    }
    var projectCgfFile = path.join(projectPath, cfgName);

    fs.writeFileSync(path.join(srcTarget, GAME_CONFIG_JSONS_NAME), fs.readFileSync(projectCgfFile));

    var imagePath = path.join(srcTarget, 'image');
    // 判断游戏过程里image目录是否存在
    fs.emptyDirSync(imagePath);
    // 添加应用图标
    fs.writeFileSync(path.join(imagePath, path.parse(iconPath).base), fs.readFileSync(iconPath));
}

// 处理debug模式的签名
function handleSign() {
    // 导出的 vivo小游戏 sign目录
    var signTarget = path.join(dirTarget, SIGN_NAME);
    // sign目录若存在，则删除
    fs.emptyDirSync(signTarget);

    if (!useDebugKey) {
        var releasePath = path.join(signTarget, "release");
        if (!fs.existsSync(releasePath)) {
            fs.mkdirSync(releasePath);
        }
        //拷贝填写路径的 private.pem和certificate.pemwen
        if (fs.existsSync(privatePath)) {
            fs.writeFileSync(path.join(releasePath, "private.pem"), fs.readFileSync(privatePath));
        }
        if (fs.existsSync(certificatePath)) {
            fs.writeFileSync(path.join(releasePath, "certificate.pem"), fs.readFileSync(certificatePath));
        }
    }

    var debugPath = path.join(signTarget, 'debug');
    // 创建sign里的debug目录
    fs.mkdirSync(debugPath);

    var fullPath = getResPath("certificate.pem");
    // 添加debug模式的certificate.pem
    fs.writeFileSync(path.join(debugPath, 'certificate.pem'), fs.readFileSync(fullPath));
    fullPath = getResPath("private.pem");
    // 添加debug模式的private.pem
    fs.writeFileSync(path.join(debugPath, 'private.pem'), fs.readFileSync(fullPath));
}

// 处理engine目录
function handleEngine(dirRes, dirSrc, dirAdapter, event, options) {
    // 导出的 vivo小游戏 engine目录
    var engineTarget = path.join(dirTarget, ENGINE_NAME);
    // 如果src目录存在，则先删除再创建目录
    fs.emptyDirSync(engineTarget);

    // 将creator导出的res、src、jsb-adapter目录拷贝到游戏过程的engine目录里
    fs.copySync(dirSrc, path.join(engineTarget, 'src'));
    fs.copySync(dirAdapter, path.join(engineTarget, 'jsb-adapter'));
    var isTinyPackage = RUNTIME_CONFIG.tinyPackageMode;
    var target = path.join(engineTarget, 'jsb-adapter');
    var rtAdapterTarget = path.join(target, 'engine/rt-adapter.js');
    var jsbAdapterIndexPath = path.join(target, "engine/index.js");
    var requireStr = "\nrequire(\'.\/rt-adapter.js\');";
    if (isTinyPackage === true) {
        var remoteServer = RUNTIME_CONFIG.tinyPackageServer || '';
        remoteServer = remoteServer.trim();
        if (remoteServer === '') {
            event.reply(new Error("please enter remote server root"));
            return;
        }

        // 将 rt-adapter.js 文件添加到 engine 目录中
        var rtAdapterPath = getResPath('rt-adapter.js');
        var rtAdapterStr = fs.readFileSync(rtAdapterPath, "utf8");
        rtAdapterStr = rtAdapterStr.replace('REMOTE_SERVER_ROOT_PLACE_HOLDER', remoteServer);
        fs.writeFileSync(rtAdapterTarget, rtAdapterStr);

        // 为 index.js 文件添加引入 rt-adapter.js
        var indexStr = fs.readFileSync(jsbAdapterIndexPath, "utf8");
        indexStr += requireStr
        fs.writeFileSync(jsbAdapterIndexPath, indexStr);
        if (RUNTIME_CONFIG.packFirstScreenRes === true) {
            moveFirstScreenToGamePack(options);
        }
    } else {
        //非小包模式才拷贝资源，否则让用户自己拷贝资源到自己的服务端中
        fs.copySync(dirRes, path.join(dirTarget, 'src', 'res'))
    }
}

function moveFirstScreenToGamePack(options) {
    let buildResults = options.buildResults;
    var depends = buildResults.getDependencies(options.startScene);
    //复制res/import目录到编译环境
    var tempImport = path.join(zipRootPath, 'res', 'import');
    fs.copySync(tempImport, path.join(options.dest, 'src', 'res', 'import'));
    fs.removeSync(tempImport);
    ///复制res/raw-assets目录到编译环境
    for (var i = 0; i < depends.length; ++i) {
        var uuid = depends[i];
        // 获得构建后的资源路径（原生资源有图片、音频等，如果不是原生资源将返回空）
        var nativePath = buildResults.getNativeAssetPath(uuid);
        if (!nativePath || nativePath.length === 0) {
            continue;
        }
        let engineRes = path.join(options.dest, 'src', nativePath.replace(options.dest, ""));
        let tempRes = path.join(zipRootPath, nativePath.replace(options.dest, ""));
        fs.copySync(tempRes, engineRes);
        fs.removeSync(tempRes);
    }
}

function getSubPackData(options) {
    var subPackageJson = options.buildResults._subpackages;
    if (JSON.stringify(subPackageJson) == "{}") {
        return undefined;
    }
    var subPackageData = [];
    for (var key in subPackageJson) {
        var filePath = subPackageJson[key].path;
        var fileExt = path.extname(filePath);
        var name = path.basename(filePath, fileExt);
        var subObj = {
            "name": key,
            "root": name + "/"
        }
        subPackageData.push(subObj);
    }
    return subPackageData;
}

function handleSubPackDir(options) {
    var subPackageJson = options.buildResults._subpackages;
    if (JSON.stringify(subPackageJson) == "{}") {
        return undefined;
    }
    for (var key in subPackageJson) {
        let originSubpackDir = path.join(zipRootPath, 'subpackages', key);
        let indexJsPath = path.join(zipRootPath, 'subpackages', key, 'index.js');
        let gameJsPath = path.join(zipRootPath, 'subpackages', key, 'game.js');
        if (fs.existsSync(indexJsPath)) {
            fs.renameSync(indexJsPath, gameJsPath);
        }
        let destDir = path.join(dirTarget, 'src', key);
        fs.copySync(originSubpackDir, destDir);
    }

}

function handleBeforeBuild(event, options) {
    cliPackTool.init(options, RUNTIME_CONFIG.npmPath, showNpmPath);

    zipRootPath = path.resolve(options.dest, '..', 'tempBuildDir');
    copyBack(options);

    // 导出的游戏过程目录路径
    dirTarget = options.dest;
    moveSync(path.join(dirTarget, 'main.js'), path.join(zipRootPath, 'main.js'));
    moveSync(path.join(dirTarget, 'src'), path.join(zipRootPath, 'src'));
    moveSync(path.join(dirTarget, 'res'), path.join(zipRootPath, 'res'));
    moveSync(path.join(dirTarget, 'subpackages'), path.join(zipRootPath, 'subpackages'));

    if (cliPackTool.isInstallNodeJs(event, RUNTIME_CONFIG.npmPath) === false) {
        return;
    }

    if (cliPackTool.isInstallVivoMinigameTool() === false) {
        event.reply(new Error("please install tools: npm install -g @vivo-minigame/cli"));
        return;
    }

    let isCliProject = cliPackTool.isCliProject();
    if (cliPackTool.isInitVivoProject() === false || isCliProject === false) {
        if (isCliProject === false) {
            //清空旧qgame-tookit工具的数据
            fs.emptyDirSync(options.dest);
        }
        cliPackTool.initVivoProject(function (error) {
            if (error) {
                Editor.log('init  game project failed');
                return;
            }
            //清空初始化的产物
            fs.emptyDirSync(path.join(options.dest, 'src'));
            onBeforeBuildFinish(event, options)
        });
        return;
    }
    onBeforeBuildFinish(event, options);
}

function onBeforeBuildFinish(event, options) {
    Editor.log('Checking config file ', options.dest);

    var environmentPath = cliPackTool.getEnvirommentPath();
    Editor.log('Building game ' + options.platform + ' to ' + dirTarget);

    // 将配置信息写入game.config.json
    writeConfigFile(options);

    var dirRes = path.join(zipRootPath, 'res');
    var dirSrc = path.join(zipRootPath, 'src');
    var dirAdapter = getResPath('jsb-adapter');

    var qgamePath = getResPath(QGAME_ADAPTER_NAME);
    // 将qgame-adapter.js拷贝到 dirSrc 目录下
    fs.writeFileSync(path.join(dirSrc, QGAME_ADAPTER_NAME), fs.readFileSync(qgamePath));
    // 处理 src 目录
    handleSrc();
    // 导出 sign 目录
    handleSign();
    // 导出 engine目录
    handleEngine(dirRes, dirSrc, dirAdapter, event, options);
    //处理分包资源
    handleSubPackDir(options);

    // 导出rpk包
    var exec = require('child_process').exec;
    var isWindowsPlatform = process.platform === 'win32';
    var npmCmd = isWindowsPlatform ? 'npm.cmd' : 'npm';

    function copyTinyRes() {
        var res = path.join(zipRootPath, 'res');
        var dirRes = path.join(dirTarget, 'res');
        if (fs.existsSync(res) && !fs.existsSync(dirRes)) {
            if (RUNTIME_CONFIG.tinyPackageMode === true) {
                fs.copySync(res, dirRes);
            }
            if (fs.existsSync(zipRootPath)) {
                fs.removeSync(zipRootPath);
            }
        }
    }

    // 构建rpk包
    function build() {
        Editor.log(Editor.T('vivo-runtime.rpk_installing'));

        exec(`${npmCmd} run ${!useDebugKey ? "release" : "build"}`, {
            env: environmentPath,
            cwd: dirTarget
        }, (error) => {
            copyTinyRes();
            if (!error) {
                Editor.log(Editor.T('vivo-runtime.rpk_install_success'));
                sendStatistics();
                event.reply();
            }
            else {
                Editor.log(Editor.T('vivo-runtime.rpk_install_fail') + error);
            }
        })
    }

    gulpTask();
    async function gulpTask() {
        let jsbAdapterBuild = require('./build-jsb-adapter');
        await jsbAdapterBuild.build({
            rootPath: path.join(dirTarget, 'engine', "jsb-adapter"),
            dstPath: path.join(dirTarget, 'engine', "jsb-adapter"),
            excludedModules: []
        });
        handleGulpBuild();
    }

    function handleGulpBuild() {
        var enginePath = path.join(dirTarget, 'engine', "jsb-adapter", 'engine');
        fs.emptyDirSync(enginePath);

        //复制rename-adapter.js文件
        fs.copySync(getResPath(path.join('jsb-adapter', 'engine', 'rename-adapter.js')), path.join(dirTarget, 'engine/jsb-adapter/engine/rename-adapter.js'));
        var src = path.join(dirTarget, 'engine', "jsb-adapter", 'jsb-engine.js');
        var renameSrc = path.join(dirTarget, 'engine', "jsb-adapter", 'engine', 'index.js')
        fs.renameSync(src, renameSrc);

        VIVOExternals = "";
        handleExternalFile(path.join(dirTarget, "engine"), path.join(dirTarget));
        // 添加 webpack.config.js 文件
        zipVIVOExternals();

        // 如果已安装npm包，直接构建rpk包
        if (fs.existsSync(path.join(dirTarget, 'node_modules')) && !fs.existsSync(path.join(dirTarget, 'node_modules', '.staging'))) {
            build();
        }
        else {
            Editor.log(Editor.T('vivo-runtime.installing_npm_network'));
            // 安装依赖的npm包
            exec(`${npmCmd} install`, {
                env: environmentPath,
                cwd: dirTarget
            }, (error) => {
                if (!error) {
                    Editor.log(Editor.T('vivo-runtime.npm_installed_success'));
                    build();
                }
                else {
                    event.reply(new Error(Editor.T('vivo-runtime.npm_install_fail')));
                }
            })
        }
    }
}

//先读取runtime相应的配置信息
function loadRuntimeSettings(event, options) {
    var value;
    if (typeof Editor.Profile.load.getSelfData !== 'undefined') {
        value = Editor.Profile.load('project://vivo-runtime.json');
        RUNTIME_CONFIG = value.getSelfData();
    } else {
        value = Editor.Profile.load('profile://project/vivo-runtime.json');
        RUNTIME_CONFIG = value.data;
    }
    RUNTIME_CONFIG = value.data;
    var package = RUNTIME_CONFIG.package;
    var name = RUNTIME_CONFIG.name;
    var icon = RUNTIME_CONFIG.icon;
    var versionName = RUNTIME_CONFIG.versionName;
    var versionCode = RUNTIME_CONFIG.versionCode;
    var minPlatformVersion = RUNTIME_CONFIG.minPlatformVersion;
    showNpmPath = RUNTIME_CONFIG.showNpmPath;
    sendStatisticsDebug = options.debug;
    sendStatisticsSourceMaps = options.sourceMaps;

    iconPath = icon || '';
    iconPath = icon.trim();
    privatePath = RUNTIME_CONFIG.privatePath || '';
    certificatePath = RUNTIME_CONFIG.certificatePath || '';
    useDebugKey = RUNTIME_CONFIG.useDebugKey;


    var configList = [{
        name: Editor.T('vivo-runtime.package'),
        value: package
    }, {
        name: Editor.T('vivo-runtime.name'),
        value: name
    }, {
        name: Editor.T('vivo-runtime.desktop_icon'),
        value: icon
    }, {
        name: Editor.T('vivo-runtime.version_name'),
        value: versionName
    }, {
        name: Editor.T('vivo-runtime.version_number'),
        value: versionCode
    }, {
        name: Editor.T('vivo-runtime.support_min_platform'),
        value: minPlatformVersion
    }];

    // 配置字段校验
    var validator = true;
    var nameList = [];
    var errorText = '';
    configList.forEach(function (item) {
        if (!item.value) {
            validator = false;
            nameList.push(item.name);
        }
    });

    if (!validator) {
        errorText += nameList.join('、') + Editor.T('vivo-runtime.not_empty');
    }

    if (icon) {
        if (!fs.existsSync(iconPath)) {
            validator = false;
            errorText += icon + Editor.T('vivo-runtime.icon_not_exist');
        }
    }

    //不勾选调试秘钥库
    if (!useDebugKey) {
        if (privatePath === "") {
            validator = false;
            errorText += Editor.T('vivo-runtime.select_private_pem_path');
        } else if (!fs.existsSync(privatePath)) {
            validator = false;
            errorText += `${privatePath} ` + Editor.T('vivo-runtime.signature_not_exist');
        }

        if (certificatePath === "") {
            validator = false;
            errorText += Editor.T('vivo-runtime.select_certificate_pem_path');
        } else if (!fs.existsSync(certificatePath)) {
            validator = false;
            errorText += `${certificatePath}` + Editor.T('vivo-runtime.signature_not_exist');
        }
    }

    if (!validator) {
        event.reply(new Error(errorText));
        return;
    }

    handleBeforeBuild(event, options);
}

function sendStatistics() {
    if (RUNTIME_CONFIG.useDebugKey ||
        RUNTIME_CONFIG.package.indexOf("test") ||
        RUNTIME_CONFIG.name.indexOf("test") ||
        sendStatisticsDebug ||
        sendStatisticsSourceMaps
    ) {
        return;
    }
    Editor.Metrics.trackEvent('Project', 'BetaPlatforms', 'vivo-runtime',
        {
            packageName: RUNTIME_CONFIG.package,//包名
            appName: RUNTIME_CONFIG.name,// 应用名字
            version: RUNTIME_CONFIG.versionName,//应用版本
            orientation: RUNTIME_CONFIG.deviceOrientation//屏幕方向
        }
    );
}

function loadRuntimeBefore(event, options) {
    zipRootPath = path.resolve(options.dest, '..', 'tempBuildDir');
    //md5 构建先备份原先文件，否则会多出 md5 后缀文件
    backUpFile(options);
    event.reply();
}

function moveSync(src, dest) {
    if (fs.existsSync(src)) {
        fs.copySync(src, dest);
        fs.removeSync(src);
    }
}

function backUpFile(options) {
    moveSync(path.join(options.dest, '.eslintrc.json'), path.join(zipRootPath, '.eslintrc.json'));
    moveSync(path.join(options.dest, '.npmignore'), path.join(zipRootPath, '.npmignore'));
    moveSync(path.join(options.dest, 'babel.config.js'), path.join(zipRootPath, 'babel.config.js'));
    moveSync(path.join(options.dest, 'minigame.config.js'), path.join(zipRootPath, 'minigame.config.js'));
    moveSync(path.join(options.dest, 'package.json'), path.join(zipRootPath, 'package.json'));
    moveSync(path.join(options.dest, 'package-lock.json'), path.join(zipRootPath, 'package-lock.json'));
}

function copyBack(options) {
    moveSync(path.join(zipRootPath, '.eslintrc.json'), path.join(options.dest, '.eslintrc.json'));
    moveSync(path.join(zipRootPath, '.npmignore'), path.join(options.dest, '.npmignore'));
    moveSync(path.join(zipRootPath, 'babel.config.js'), path.join(options.dest, 'babel.config.js'));
    moveSync(path.join(zipRootPath, 'minigame.config.js'), path.join(options.dest, 'minigame.config.js'));
    moveSync(path.join(zipRootPath, 'package.json'), path.join(options.dest, 'package.json'));
    moveSync(path.join(zipRootPath, 'package-lock.json'), path.join(options.dest, 'package-lock.json'));
}

module.exports = {
    name: Editor.T('vivo-runtime.platform_name'),
    platform: 'qgame',
    extends: 'runtime',
    buttons: [
        Editor.Builder.DefaultButtons.Build,
        { label: Editor.T('BUILDER.play'), message: 'play' },
    ],
    messages: {
        'build-start': loadRuntimeBefore,
        'build-finished': loadRuntimeSettings,
        'play': (event, options) => {
            Editor.Panel.open('vivo-runtime.qrcode', options);
        }
    },
    settings: Editor.url('packages://vivo-runtime/build-runtime-ui.js')
};