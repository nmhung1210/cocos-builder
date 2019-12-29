var path = require('path');
var execSync = require('child_process').execSync;
var spawn = require('child_process').spawn;
var fs = require('fire-fs');
var options;
var pid;
var qrPort;
var RUNTIME_CONFIG;
var fixPath = require('fix-path');

var setOptions = function (ops) {
    options = ops;
}

var getEnviromment = function () {
    var environmentPath = {};
    RUNTIME_CONFIG = (Editor.remote.Profile.load('profile://project/vivo-runtime.json')).data;
    let npmPath = RUNTIME_CONFIG.npmPath;
    if (npmPath) {
        Editor.log(Editor.T('vivo-runtime.custom_npm_path_config'), npmPath);
        //window
        if (process.platform === 'win32') {
            environmentPath['Path'] = RUNTIME_CONFIG.npmPath;
            environmentPath['Path'] += ";C:\\Windows\\System32";
        }
        else {
            environmentPath['PATH'] = RUNTIME_CONFIG.npmPath;
            environmentPath['PATH'] += ":/usr/bin:/bin:/usr/sbin:/sbin";

        }
    }
    else {
        Editor.log(Editor.T('vivo-runtime.custom_npm_path_not_config'));
        if (!process.platform === 'win32' && process.env.PATH.indexOf(NPM_PATH) === -1) {
            process.env.PATH += `:${NPM_PATH}`;
        }
        fixPath();
        environmentPath = process.env;
    }
    return environmentPath;
}

function printNotInstallNodeError() {
    if (RUNTIME_CONFIG && RUNTIME_CONFIG.npmPath) {
        Editor.error(Editor.T('vivo-runtime.custom_npm_path_config_error'));
        return;
    }
    if (process.platform === 'win32') {
        Editor.error(Editor.T('vivo-runtime.not_install_nodejs_windows_error_before_preview'));
    }
    else {
        Editor.error(Editor.T('vivo-runtime.not_install_nodejs_mac_error_before_preview'));
    }
}

function isInstallNode(environmentPath) {
    try {
        execSync(`node -v`, { env: environmentPath });
    } catch (error) {
        return false;
    }
    return true;
}

var npmRunServer = function (complet, err) {

    var environmentPath = getEnviromment();
    if (!isInstallNode(environmentPath)) {
        printNotInstallNodeError();
        return;
    }

    var dir = options.dest;
    var node_modules = path.join(dir, "node_modules");
    var dist = path.join(dir, "dist");

    if (!fs.existsSync(node_modules) || !fs.existsSync(dist)) {
        Editor.error(Editor.T('vivo-runtime.buidBeforePreview'));
        return;
    }

    var npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    free = spawn(`${npmCmd}`, [`run`, 'server'], {
        env: environmentPath,
        cwd: dir
    });

    var qrIPPort;
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
        pid = free.pid;
        if (data && data.indexOf("地址 http:") !== -1) {
            var output = data.toString().replace(/[\n\r]/g, "");
            //获取二维码地址
            var reg = /http:\/\/[^\s]*:\d*/;
            qrIPPort = output.match(reg)[0];
            complet(qrIPPort);
            return;
        }
    });

    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
        Editor.error(data);
    });

    // 注册子进程关闭事件
    free.on('exit', function (code, signal) {
        // Editor.log('=======child process eixt ,exit:' + code);
    });
    free.on('close', function (code, signal) {
        // Editor.log('=======child process close ,exit:' + code);
    });
}

var closePort = function () {
    var kill = require(Editor.url('packages://vivo-runtime/lib/killPort'));
    if (pid) {
        kill(pid, qrPort);
    }
    pid = undefined;
}

let vivo = {
    npmRunServer,
    setOptions,
    closePort,
    options
}
module.exports = vivo;