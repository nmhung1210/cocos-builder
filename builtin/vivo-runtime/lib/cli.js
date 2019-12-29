var { exec, execSync } = require('child_process');
var path = require('path');
var fs = require('fire-fs');
var fixPath = require('fix-path');
var PROJECT_NAME = 'qgame';
var options;
var environmentPath = {};

var init = function (opt, npmPath, showNpmPath) {
    this.options = opt;
    this.initEnvironmentPath(npmPath, showNpmPath);
}

var getEnvirommentPath = function () {
    return this.environmentPath;
}

var isInstallNodeJs = function (event, npmPath) {
    try {
        execSync(`node -v`, {
            env: this.environmentPath,
        });
    } catch (error) {
        if (npmPath) {
            event.reply(new Error(Editor.T('vivo-runtime.custom_npm_path_config_error')));
            return;
        }
        Editor.Ipc.sendToWins('builder:events', 'npmPath-show');
        event.reply();
        if (process.platform === 'win32') {
            Editor.log(Editor.T('vivo-runtime.not_install_nodejs_windows_error'));
        }
        else {
            Editor.log(Editor.T('vivo-runtime.not_install_nodejs_mac_error'));
        }
        return false;
    }
    return true;
};


var initEnvironmentPath = function (npmPath, showNpmPath) {
    this.environmentPath = {};
    //判断自定义npm路径
    if (npmPath) {
        Editor.log(Editor.T('vivo-runtime.custom_npm_path_config'), npmPath);
        //window
        if (process.platform === 'win32') {
            this.environmentPath['Path'] = npmPath;
        }
        else {
            this.environmentPath['PATH'] = npmPath;
            this.environmentPath['PATH'] += ":/usr/bin:/bin:/usr/sbin:/sbin";

        }
    }
    else {
        if (showNpmPath) {
            Editor.log(Editor.T('vivo-runtime.custom_npm_path_not_config'));
        }
        fixPath();
        this.environmentPath = process.env;
    }

}


var initVivoProject = function (callback) {
    exec(`mg init ${PROJECT_NAME} --force`, {
        env: this.environmentPath,
        cwd: path.join(this.options.dest, '..')
    }, (error) => {
        callback(error);
    });
}

var isInitVivoProject = function () {
    if (fs.existsSync(path.join(this.options.dest, 'node_modules')) && !fs.existsSync(path.join(this.options.dest, 'node_modules', '.staging'))) {
        return true;
    }
    return false;
}

var isInstallVivoMinigameTool = function () {
    try {
        result = execSync(`mg -v`, {
            env: this.environmentPath,
        });
    } catch (error) {
        return false;
    }
    return true;
}

var isCliProject = function () {
    if (fs.existsSync(path.join(this.options.dest, 'minigame.config.js'))) {
        return true;
    }
    return false;
}

let cli = {
    init,
    initVivoProject,
    initEnvironmentPath,
    isInitVivoProject,
    isInstallVivoMinigameTool,
    isCliProject,
    getEnvirommentPath,
    isInstallNodeJs
}
module.exports = cli;