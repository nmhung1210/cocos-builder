let e=require("./utils.js"),r=require("./network.js"),i=require("./serviceConfig.js"),t=require("fs");var s,a="https://creator-api.cocos.com/api/";"use strict";var o,n,c,d,l,v,p,u=!1,g=!1;Array.prototype.equals=function(e){if(!e)return!1;if(this.length!=e.length)return!1;for(var r=0,i=this.length;r<i;r++)if(this[r]instanceof Array&&e[r]instanceof Array){if(!this[r].equals(e[r]))return!1}else if(this[r]!=e[r])return!1;return!0},Object.defineProperty(Array.prototype,"equals",{enumerable:!1}),module.exports={async init(){if(console.log("ccServices init"),this.readServiceConfig(),!g){var r=`Cocos Services Version ${this.getServiceVersion()}`;console.log(r),u&&!Editor.isMainProcess&&e.printToCreatorConsole("info",r),g=!0}if((p=await Editor.User.isLoggedIn())||u){s=u?await this.userLogin():this.getSessionID();var t=await this.getSessionToken();s.session_token=t.data.session_token;var a=await this.getUserInfo();for(var o in a.data)s[o]=a.data[o];l={data:i.readBindGame()},n=await this.getGameList(),d=await this.getTargetUrl(),c=await this.getServiceList(),i.writeServiceList(c.data)}else s={corporation_id:"0"},l={data:i.readBindGame()},null==(c={data:i.readServiceList()}).data&&(c=await this.getServiceList(),i.writeServiceList(c.data));v||(v=i.readEnableService())},readServiceConfig(){var e=i.readServiceConfig();e.devmode&&(u=!0,a="https://test-creator-api.cocos.com/api/",o={username:e.username,password:e.password})},readDevMode:()=>i.readDevMode(),writeDevMode(e){i.writeDevMode(e),e||this.init()},registerServiceComponent(r){var i=e.getCreatorHomePath()+"/services";if(r){var s=r.split("-")[1],a=i+"/"+s+"/pages/index.js";t.existsSync(a)&&(delete require.cache[require.resolve(a)],require(a),this.registerI18n(r))}else{if(!t.existsSync(i))return;t.readdirSync(i).forEach(e=>{var r=i+"/"+e,s=t.statSync(r);s&&s.isDirectory()&&t.existsSync(r+"/pages/index.js")&&(delete require.cache[require.resolve(r+"/pages/index.js")],require(r+"/pages/index.js"),this.registerI18n(`service-${e}`))})}},registerI18n(r){var i=e.getCreatorHomePath()+"/services",s=r.split("-")[1],a=i+"/"+s+`/pages/i18n/${e.getLang()}.js`;if(t.existsSync(a))try{Editor.i18n.extend({[`cocos-services.${s}`]:require(a)})}catch(e){}},readServicePackageInfo(r){var i=e.getCreatorHomePath()+"/services"+"/"+r.split("-")[1]+"/package.json";return t.existsSync(i)?e.readJson(i):{version:e.t("not_installed")}},readServiceVersionByURL(e){if(e){var r=e.split("/");return r[r.length-1].replace(".zip","")}return""},execInstallNativePlatformScript(r,s){this.readServiceConfig();var a=e.getCreatorHomePath()+"/services",o=i.readEnableService(),n=i.readServiceList();if(void 0===n)return e.printToCreatorConsole("warn","services not exists"),s(!0),void 0;if(!i.needExecNative())return s(!0),void 0;for(var c of(v||(v=o),this.backiOSPbxFile(r,!v.equals(o)),n)){var d=c.service_component_name.split("-")[1],l=a+"/"+d+"/install.js";if(t.existsSync(l)){var p=i.readServiceParam(c.service_id);try{delete require.cache[require.resolve(l)];var g=require(l);o.indexOf(c.service_id)>=0?g.onBuildedProjectEnable?(g.onBuildedProjectEnable(r,p),this.serviceIntegrationSubmit(c,"服务集成成功","Building Time")):u&&e.printToCreatorConsole("warn",`${e.t("must_dev_info_1")} ${c.service_name} SDK ${e.t("must_dev_info_install1")} -- ( onBuildedProjectEnable(options, params) {} )`):g.onBuildedProjectDisable?g.onBuildedProjectDisable(r,p):u&&e.printToCreatorConsole("warn",`${e.t("must_dev_info_1")} ${c.service_name} SDK ${e.t("must_dev_info_uninstall1")} -- ( onBuildedProjectDisable(options, params) {} )`)}catch(r){this.serviceIntegrationSubmit(c,"服务集成失败","Building Time",r.valueOf()),u&&e.printToCreatorConsole("warn",`${d}\n\t${r.valueOf()}`)}}}v=o,s(!0)},execInstallH5PlatformScript(r,i,s){this.readServiceConfig();var a=e.getCreatorHomePath()+"/services",o=r.service_component_name.split("-")[1],n=a+"/"+o+"/install.js";if(t.existsSync(n))try{delete require.cache[require.resolve(n)];var c=require(n);s?c.onServiceEnable?(c.onServiceEnable(e.getProjectPath(),i),this.serviceIntegrationSubmit(r,"服务集成成功","Editing Time")):u&&e.printToCreatorConsole("warn",`${e.t("must_dev_info_1")} ${r.service_name} JSSDK ${e.t("must_dev_info_install1")} -- ( onServiceEnable(projectPath, params) {} )`):c.onServiceDisable?c.onServiceDisable(e.getProjectPath(),i):u&&e.printToCreatorConsole("warn",`${e.t("must_dev_info_1")} ${r.service_name} JSSDK ${e.t("must_dev_info_uninstall1")} -- ( onServiceDisable(projectPath, params) {} )`)}catch(i){this.serviceIntegrationSubmit(r,"服务集成失败","Editing Time",i.valueOf()),u&&e.printToCreatorConsole("warn",`${o}\n\t${i.valueOf()}`)}},serviceIntegrationSubmit(e,r,t,a){var o={uid:s&&s.cocos_uid?s.cocos_uid:"",client_id:"CreatorServices",event:r,key_list:JSON.stringify(["app_id","app_name","service_id","service_name","time",a?"error":""]),value_list:JSON.stringify([i.readBindGame().appid,i.readBindGame().name,e.service_id?e.service_id:"",e.service_name?e.service_name:"",t,a?JSON.stringify(a):""])};this.submitLog(o)},serviceExists(r){var i=e.getCreatorHomePath()+"/services"+"/"+r.split("-")[1];return t.existsSync(i)},backiOSPbxFile(r,i){var s=r.dest+"/frameworks/runtime-src/proj.ios_mac/";if(t.existsSync(s)){var a=Date.parse(new Date);t.existsSync(s+"_backup/"+r.projectName+".xcodeproj")?i&&(t.renameSync(s+r.projectName+".xcodeproj",s+"_backup/"+r.projectName+"-"+a+".xcodeproj"),e.copyDir(s+"_backup/"+r.projectName+".xcodeproj",s+r.projectName+".xcodeproj")):e.copyDir(s+r.projectName+".xcodeproj",s+"_backup/"+r.projectName+".xcodeproj")}},installServicePackage(i,t,s){const a=require("fs");var o=e.getCreatorHomePath()+"/services/",n=e.getCreatorHomePath()+"/download/";!a.existsSync(o)&&e.mkdirs(o),!a.existsSync(n)&&e.mkdirs(n);var c,d=n+t+".zip";if(!i.match(".zip"))return s({text:"failed",complete:!0}),void 0;r.download(i,d,(r,t)=>{if(r)return s({text:"failed",complete:!0}),void 0;var n=e.t("downloading")+t.progress+"%";if(c!=t.progress&&(c=t.progress,s({text:n,complete:!1})),"complete"===t.status){if(100!==t.progress)return s({text:"failed",complete:!0}),void 0;e.unzip(d,o,r=>{r?s({text:"failed",complete:!0}):(s({text:e.t("installed"),complete:!0}),a.existsSync(i)&&a.unlinkSync(i))})}})},uninstallServicePackage(r){var i=e.getCreatorHomePath()+"/services/"+r.split("-")[1];e.removeDir(i)},getServicePackageDownloadUrl:(e,r)=>e.replace(/[0-9].[0-9].[0-9]_[\x00-\xff]+.zip/,r+".zip"),async userLogin(){var i=a+"account/signin";return(await r.postAsync(i,{username:o.username,password:o.password,lang:e.getLang()})).data},async getSessionCode(){var e=a+"session/code",i={session_id:s.session_id};return await r.postAsync(e,this.paramPrase(i))},async openService(e,i,t){var o=a+"service/open",n={app_id:e,service_id:i,session_token:s.session_token};try{var c=await r.postAsync(o,this.paramPrase(n));t&&(0===c.status?t(!0):t(!1))}catch(e){t&&t(!1,e)}},async getSessionToken(){var e=a+"session/token",i={session_code:(await this.getSessionCode()).data.session_code,ip:"127.0.0.1"};return await r.postAsync(e,this.paramPrase(i))},async getServiceList(){var i=a+"service/lists";return await r.postAsync(i,{lang:e.getLang()})},async getGameList(){var e=a+"game/lists",i={session_token:s.session_token,ip:"127.0.0.1"},t=await r.postAsync(e,this.paramPrase(i));return n=t,t},async submitLog(e){var i=a+"log/add",t=this.paramPrase(e);await r.postAsync(i,t);u&&(e.submit_time=(new Date).toLocaleString(),console.log(e))},async getGameDetail(e){var i=a+"game/detail",t={session_token:s.session_token,ip:"127.0.0.1",app_id:e||l.data.app_id},o=await r.postAsync(i,this.paramPrase(t));return l=o,o},async getUserInfo(){var e=a+"user/info",i={session_token:s.session_token,ip:"127.0.0.1"};return await r.postAsync(e,this.paramPrase(i))},async getTargetUrl(){var e=a+"service/urls",i={session_token:s.session_token,ip:"127.0.0.1"};return await r.postAsync(e,this.paramPrase(i))},getUserIsLogin:()=>p,getUserData(){return s||this.init(),s},async getUserDataAsync(){var e=await this.getUserInfo();for(var r in e.data)s[r]=e.data[r];return s},getGameLists(){return n||this.init(),n},getServiceLists(){return c||this.init(),c},getGame:()=>l||null,getUrl(r,i){if(!d)return e.printToCreatorConsole("warn",e.t("no_url_info")),"null data";var t,a=`${d.data.client_signin_url}session_id=${s.session_id}&redirect_url=`;return"dashboard"===r?t=a+d.data.cocos_dashboard_url:"create"===r?t=a+d.data.cocos_game_create_url:"service"===r?t=a+d.data.cocos_service_url:"enable_service"===r?t=a+encodeURIComponent(d.data.cocos_service_open_url+"?"+this.urlEncode(i).substring(1)):"person_verify"===r?t=a+d.data.cocos_personal_verify_url:"company_verify"===r?t=a+d.data.cocos_company_verify_url+"?"+this.urlEncode(i).substring(1):"person_bind_phone"===r?t=a+d.data.cocos_mobile_bind_personal_url:"company_bind_phone"===r&&(t=a+d.data.cocos_mobile_bind_company_url),t},getSessionID(){var r;r="2.2"===(Editor.isMainProcess?Editor.App.version:Editor.remote.App.version).substr(0,3)?"/profiles/user_token.json":"/user_token.json";var i=e.getCreatorHomePath()+r;return e.readJson(i)},getServiceVersion:()=>e.readJson(Editor.url("packages://cocos-services/package.json")).version,getDisplayVersion:()=>Editor.remote.versions.CocosCreator,paramPrase(r){var i=require("md5"),t=r;t.plugin_id="1025",t.lang=e.getLang(),t=this.objKeySort(t);var s=this.urlEncode(t)+"&32104adac01fdec28ac19df0b2f42d532b06311d";return t.sign=i(s.substr(1)),t},urlEncode(e,r,i){if(null==e)return"";var t="",s=typeof e;if("string"==s||"number"==s||"boolean"==s)t+="&"+r+"="+(i?encodeURIComponent(e):e);else for(var a in e){var o=null==r?a:r+(e instanceof Array?"["+a+"]":"."+a);t+=this.urlEncode(e[a],o,i)}return t},objKeySort(e){for(var r=Object.keys(e).sort(),i={},t=0;t<r.length;t++)i[r[t]]=e[r[t]];return i}};