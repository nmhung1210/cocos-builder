/**
 * Created by wzm on 20/07/2018.
 */

'use strict';

exports.template = `
        <ui-prop name="${Editor.T('cpk-publish.screen_orientation')}">
            <ui-select class="flex-1" v-value="runtimeSetting.deviceOrientation">
                <option value="portrait">${Editor.T('cpk-publish.vertical_screen')}</option>
                <option value="landscape">${Editor.T('cpk-publish.horizontal_screen')}</option>
            </ui-select>
        </ui-prop>
        <ui-prop name="${Editor.T('cpk-publish.out_cpk_path')}" >
            <ui-checkbox v-value="runtimeSetting.useCustomCpkPath"></ui-checkbox>
            <ui-input v-value="runtimeSetting.outputCpkPath" class="flex-1" v-show="runtimeSetting.useCustomCpkPath"
                 placeholder="${Editor.T('cpk-publish.out_cpk_path_hint')}"></ui-input>
            <ui-button class="tiny" v-on:confirm="onCpkPath" v-show="runtimeSetting.useCustomCpkPath">···</ui-button>
        </ui-prop>

        <ui-prop name="${Editor.T('cpk-publish.use_native_renderer')}" v-show="false">
            <ui-checkbox v-value="project.nativeRenderer"></ui-checkbox>
        </ui-prop>

        <ui-prop name="${Editor.T('cpk-publish.small_packet_mode')}" auto-height>
            <ui-checkbox v-value="runtimeSetting.tinyPackageMode"></ui-checkbox>
        </ui-prop>

        <ui-prop name="${Editor.T('cpk-publish.small_packet_path')}"  v-disabled='!runtimeSetting.tinyPackageMode' auto-height>
            <ui-input class="flex-1" v-value="runtimeSetting.tinyPackageServer" placeholder="${Editor.T('cpk-publish.small_packet_path_hint')}"></ui-input>
        </ui-prop>

       <ui-prop name="${Editor.T('cpk-publish.pack_res_to_first_pack')}"  v-disabled='!runtimeSetting.tinyPackageMode'>
             <ui-checkbox v-value="runtimeSetting.packFirstScreenRes"></ui-checkbox>
        </ui-prop>

        <ui-prop name="${Editor.T('cpk-publish.worker_path')}" auto-height  v-show="false">
            <ui-checkbox v-value="project.nativeRenderer"></ui-checkbox>
            <ui-input
                 class = "flex-1"
                 v-value = "runtimeSetting.workerPath"
                 placeholder = "${Editor.T('cpk-publish.worker_path_hint')}"
            ></ui-input>
        </ui-prop>

         <ui-prop name="MD5 Cache ">
            <ui-checkbox v-value="project.md5Cache"></ui-checkbox>
        </ui-prop>
`;

exports.name = 'jkw-game';

exports.data = function () {
    return {
        runtimeSetting: {
            tinyPackageMode: false,
            tinyPackageServer: "",
            workerPath: "",
            useCustomCpkPath: false,
            outputCpkPath: "",
            packFirstScreenRes: false,
            deviceOrientation: "portrait",
        },
        //记录原来的EncryptJs的选项
        originEncryptJs: false,
        profile: null,
    };
};

exports.watch = {
    runtimeSetting: {
        handler(val) {
            //兼容2.2.0以下
            if (typeof this.profile.set !== 'undefined') {
                this.profile.set('', this.runtimeSetting);
            }
            else {
                Object.assign(this.profile.data, this.runtimeSetting);
            }
            this.profile.save();
        },
        deep: true,
    }
};

exports.created = function () {
    this.originEncryptJs = this.project.encryptJs;
    this.includeSDKBox = this.project.includeSDKBox;
    this.project.encryptJs = false;
    this.project.includeSDKBox = false;
    //兼容2.2.0以下
    if (typeof Editor.Profile.load.getSelfData !== 'undefined') {
        this.profile = Editor.Profile.load('project://cpk-runtime.json');
        this.runtimeSetting.forEach(key => {
            this.runtimeSetting[key] = this.profile.get(key);
        });
    } else {
        Editor.Profile.load('profile://project/cpk-publish.json', (err, ret) => {
            if (err) return;
            this.profile = ret;
            this.runtimeSetting = ret.data;
        });
    }
};

exports.directives = {};
exports.beforeDestroy = function () {
    this.project.encryptJs = this.originEncryptJs;
    this.project.includeSDKBox = this.includeSDKBox;
};

exports.methods = {
    _getProjectPath() {
        return Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path;
    },
    onCpkPath(event) {
        event.stopPropagation();
        let res = Editor.Dialog.openFile({
            defaultPath: this._getProjectPath(),
            properties: ['openDirectory'],
            filters: [
                { name: Editor.T('cpk-publish.out_cpk_path_hint') }
            ],
        });
        if (res && res[0]) {
            this.runtimeSetting.outputCpkPath = res[0];
        }
    }
};