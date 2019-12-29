const e=require("fire-path"),t=require("fire-url"),s=require("fire-fs"),{format:i,promisify:n}=require("util"),a=require("electron").ipcMain,r=require("globby"),o=require("gulp").Gulp,l=require("gulp-rename"),c=require("gulp-util"),u=require("event-stream"),d=require("stream-combiner2"),p=require("gulp-sequence"),m=require("gulp-rev-all"),g=require("gulp-rev-delete-original"),b=require("del"),f=(require("async"),require("lodash")),j=require("winston"),h=require("crypto"),v=require("./compiler"),y=require("./native-utils"),k=require("../share/build-platforms"),w=require("./build-results"),E="build-platform_",S="db://",x="window._CCSettings",O=5;function q(t){return u.through(function(s){if(".html"===e.extname(s.path)){j.normal("Generating html from "+s.path);var i=t.webOrientation;"auto"===i&&(i="");const a=Editor.url("app://node_modules/vConsole/dist/vconsole.min.js"),r=`<script src="${e.basename(a)}"><\/script>`;var n={file:s,project:t.projectName||e.basename(t.project),previewWidth:t.previewWidth,previewHeight:t.previewHeight,orientation:i,webDebugger:t.embedWebDebugger?r:""};s.contents=new Buffer(c.template(s.contents,n))}else if("main.js"===e.basename(s.path)){j.normal("Generating main.js from "+s.path);let e=s.contents.toString(),i="";t.includeAnySDK=!1,t.includeAnySDK&&(i="    \n    if (cc.sys.isNative && cc.sys.isMobile) {\n        jsList = jsList.concat(['src/anysdk/jsb_anysdk.js', 'src/anysdk/jsb_anysdk_constants.js']);\n    }\n"),e=e.replace(/<Inject anysdk scripts>/g,i);let r="qqplay"===t.platform;if(r&&t.qqplay&&t.qqplay.REMOTE_SERVER_ROOT){let s='qqPlayDownloader.REMOTE_SERVER_ROOT = "'+t.qqplay.REMOTE_SERVER_ROOT+'"';e=e.replace(/qqPlayDownloader.REMOTE_SERVER_ROOT = ""/g,s)}let o="wechatgame-subcontext"===t.platform,l="baidugame-subcontext"===t.platform,u="wechatgame"===t.platform||o,d="baidugame"===t.platform||l;n={file:s,renderMode:t.renderMode,isWeChatGame:u,isBaiduGame:d,isWeChatSubdomain:o,isBaiduSubdomain:l,isQQPlay:r,engineCode:"",projectCode:""};if(r){var a=t.debug;n.engineCode=a?"'GameRes://cocos2d-js.js'":"'GameRes://cocos2d-js-min.js'",n.projectCode=a?"'GameRes://src/project.dev.js'":"'GameRes://src/project.js'"}s.contents=new Buffer(c.template(e,n))}this.emit("data",s)})}function _(e,t){var s=JSON.stringify(e,null,t?4:0).replace(/"([A-Za-z_$][0-9A-Za-z_$]*)":/gm,"$1:");return s=t?`${x} = ${s};\n`:`${x}=${s};`}function R(e,s){var i=e.customSettings,n=e.debug,a=Object.create(null),r=!e.preview,o=Editor.assetdb,l=Editor.assets,c=Editor.Utils.UuidUtils.compressUuid;function u(e,s,i,n){if(!e)return console.error("can not get url to build: "+s),null;if(!e.startsWith(S))return console.error("unknown url to build: "+e),null;var a=Editor.assetdb.isSubAssetByUuid(s);if(a){var r=t.dirname(e),o=t.extname(r);o&&(r=r.slice(0,-o.length)),e=r}var l=e.indexOf("/",S.length);if(l<0)return console.error("no mount to build: "+e),null;var c=e.slice(S.length,l);if(!c)return console.error("unknown mount to build: "+e),null;var u=e.slice(l+1);return u?("audio-clip"===i&&(n||(n=Editor.assetdb.loadMetaByUuid(s)),n&&"1"===n.downloadMode&&(u+="?useDom=1")),{mountPoint:c,relative:u,uuid:s,isSubAsset:a}):(console.error("unknown relative to build: "+e),null)}console.time("queryAssets"),function(e,t){let s=function(e){let t=Editor.Builder.simpleBuildTargets[e];return t&&t.extends||e}(i.platform),n=k[s].isNative;if(e){for(var a=[],r=0,c=e.length;r<c;r++){var d=e[r],p=o.uuidToUrl(d),m=o.assetInfoByUuid(d);if(m){var g=m.type;if(g){var b=u(p,d,g);if(!b)continue;var f=l[g];b.ctor=f||cc.RawAsset,a.push(b)}else console.error("Can not get asset type of "+d)}else console.error("Can not get asset info of "+d)}o.queryMetas("db://**/*","javascript",function(e,s){var i;i=n?e=>e.isPlugin&&e.loadPluginInNative:e=>e.isPlugin&&e.loadPluginInWeb;var r=s.filter(i).map(e=>e.uuid);t(null,a,r)})}else console.time("queryMetas"),o.queryMetas("db://**/*","",function(e,s){console.timeEnd("queryMetas");for(var i=[],a=[],r=0,c=s.length;r<c;r++){var d=s[r],p=d.assetType();if("folder"!==p){"javascript"===p&&d.isPlugin&&(n?d.loadPluginInNative&&a.push(d.uuid):d.loadPluginInWeb&&a.push(d.uuid));var m=d.uuid,g=u(o.uuidToUrl(m),m,p,d);if(g&&g.relative.startsWith("resources/")){var b=l[p];g.ctor=b||cc.RawAsset,i.push(g)}}}t(e,i,a)})}(e.uuidList,function(t,l,u){if(console.timeEnd("queryAssets"),t)return s(t);console.time("writeAssets"),function(e,t){var s,i=cc.RawAsset,a=e.rawAssets={assets:{}};n||(s=e.assetTypes=[]);var o={};t=f.sortBy(t,"relative");for(var l=Object.create(null),u=0,d=t.length;u<d;u++){var p=t[u],m=p.mountPoint;if(!p.ctor||i.isRawAssetType(p.ctor)){Editor.error(`Failed to get ctor of '${p.relative}'(${p.uuid}).\n`+"Since 1.10, if the asset is RawAsset, refactor to normal Asset please.\nIf not RawAsset, please ensure the class of asset is loaded in the main process of the editor.");continue}if(!p.relative.startsWith("resources/"))continue;if(p.isSubAsset&&cc.js.isChildClassOf(p.ctor,cc.SpriteFrame)){var g,b=p.relative;if(b in l)g=l[b];else{let e=b+".";g=t.some(function(t){var s=t.relative;return(s===b||s.startsWith(e))&&!t.isSubAsset&&t.ctor===cc.SpriteAtlas}),l[b]=g}if(g)continue}var j=a[m];j||(j=a[m]={});var h,v=cc.js._getClassId(p.ctor,!1);if(!n){var y=o[v];void 0===y&&(s.push(v),y=s.length-1,o[v]=y),v=y}var k=p.relative.slice("resources/".length);h=p.isSubAsset?[k,v,1]:[k,v];let e=p.uuid;r&&(e=c(e,!0)),j[e]=h}}(i,l),console.timeEnd("writeAssets"),function(e,t){for(var s=[],i=0;i<t.length;i++){var n=t[i],r=o.uuidToUrl(n);r=r.slice(S.length),a[r]=n,s.push(r)}s.sort(),s.length>0&&(e.jsList=s)}(i,u),e.sceneList.length>0&&(i.launchScene=Editor.assetdb.uuidToUrl(e.sceneList[0])),function(e,t){t=t.map(e=>{var t=Editor.assetdb.uuidToUrl(e);return t?(r&&(e=c(e,!0)),{url:t,uuid:e}):(Editor.warn(`Can not get url of scene ${e}, it maybe deleted.`),null)}).filter(Boolean),e.scenes=t}(i,e.sceneList),i.packedAssets=function(e){if(r&&e){var t={};for(var s in e){var i=e[s];t[s]=i.map(e=>c(e,!0))}e=t}return e}(e.packedAssets)||{},i.md5AssetsMap={},i.orientation=e.webOrientation,i.debug=n,i.subpackages=e.subpackages,i.server=e.server,(!("stringify"in e)||e.stringify)&&(i=_(i,n)),s(null,i,a)})}exports.startWithArgs=function(t,S){function M(e){C.isRunning?C.stop(e):Editor.error(e)}var C=new o,T=p.use(C),A=t.project,U=t.projectName||e.basename(A),B=t.platform,D=t.actualPlatform,N=!!t.nativeRenderer,P="wechatgame-subcontext"===B,$="wechatgame"===B||P,F=t.wechatgame.separate_engine;let L="baidugame-subcontext"===B,I="baidugame"===B||L,J="xiaomi"===D,W="alipay"===D;var G,V="runtime"===B,H=!!t.debug,z=t.sourceMaps,X="qqplay"===t.platform;if(H&&(F=!1),P||L){let s=e.dirname(t.dest);t.dest=e.join(s,U)}X?G=t.qqplay.orientation:"auto"===(G=t.webOrientation)&&(G="");var K=t.debugBuildWorker,Q=k[B].isNative,Z=t.dest;if(Editor.log("Building "+A),Editor.log("Destination "+Z),e.normalize(Z)===e.normalize(A))return S(new Error("Can not export project at project folder."));if(e.contains(Editor.App.path,Z))return S(new Error("Can not export project to fireball app folder."));var Y,ee={tmplBase:e.resolve(Editor.url("unpack://static"),"build-templates"),jsCacheDir:Editor.url("unpack://engine/bin/.cache/"+B)};Y=H?Q?V?"cocos2d-runtime.js":"cocos2d-jsb.js":"cocos2d-js.js":Q?V?"cocos2d-runtime-min.js":"cocos2d-jsb-min.js":"cocos2d-js-min.js",Object.assign(ee,{template_shares:e.join(ee.tmplBase,"shares/**/*"),template_web_desktop:e.join(ee.tmplBase,H?"web-desktop/template-dev/**/*":"web-desktop/template/**/*"),template_web_mobile:e.join(ee.tmplBase,H?"web-mobile/template-dev/**/*":"web-mobile/template/**/*"),bundledScript:e.join(Z,"src",H?"project.dev.js":"project.js"),src:e.join(Z,"src"),res:e.join(Z,"res"),subpackages:e.join(Z,"subpackages"),settings:e.join(Z,"src/settings.js"),depends:e.join(Z,"res/depends.json"),jsCache:e.join(ee.jsCacheDir,Y),jsCacheExcludes:e.join(ee.jsCacheDir,H?".excludes":".excludes-min"),webDebuggerSrc:Editor.url("app://node_modules/vconsole/dist/vconsole.min.js"),template_instant_games:e.join(ee.tmplBase,"fb-instant-games/**/*"),quickScripts:e.join(A,"temp/quick-scripts"),destQuickScripts:e.join(Z,"scripts")});let te=new w;C.task("compile",function(e){Editor.Ipc.sendToMain("builder:state-changed","compile",.1);var t={project:A,platform:B,actualPlatform:D,destRoot:Z,dest:ee.bundledScript,debug:H,sourceMaps:z,subpackages:ee.subpackages};v._runTask(t,function(t,s){t?M(t):(te._subpackages=s,e())})}),C.task("build-assets",["compile"],function(e){var s,i;Editor.log("Start building assets"),Editor.Ipc.sendToMain("builder:state-changed","spawn-worker",.3);function n(t,n){if(s=!0,i&&!K){var a=i;i=null;try{a.nativeWin.destroy()}catch(e){}}if(C.isRunning){try{n=n.replace(/^Error:\s*/,"")}catch(e){}e(new Error(n))}else Editor.error(n)}a.once("app:build-project-abort",n),j.normal("Start spawn build-worker");var r=!1;Editor.App.spawnWorker("app://editor/page/build/build-worker",function(o,l){j.normal("Finish spawn build-worker"),i=o,r||(r=!0,l.once("closed",function(){s||(a.removeListener("app:build-project-abort",n),Editor.log("Finish building assets"),e())})),j.normal("Start init build-worker"),Editor.Ipc.sendToMain("builder:state-changed","init-worker",.32),i.send("app:init-build-worker",B,H,function(e){function n(){!i||K||(i.close(),i=null)}e?(M(e),s=!0,n()):s||(j.normal("Finish init build-worker"),j.normal("Start build-assets in worker"),Editor.Ipc.sendToMain("builder:state-changed","build-assets",.65),i.send("app:build-assets",ee.res,B,H,f.pick(t,"scenes","inlineSpriteFrames","mergeStartScene","optimizeHotUpdate","wechatgame","baidugame","excludedModules"),function(e,t,i){s||(e?(M(e),s=!0):t&&(te._buildAssets=t,te._packedAssets=i),j.normal("Finish build-assets in worker"),n())},-1))},-1)},K,!0)});var se=null,ie=null;C.task("build-settings",["build-assets"],function(e){var s=Editor.Profile.load("profile://project/project.json");let i={stringify:!1,customSettings:{platform:D,groupList:s.data["group-list"],collisionMatrix:s.data["collision-matrix"]},sceneList:t.scenes,uuidList:te.getAssetUuids(),packedAssets:te._packedAssets,webOrientation:G,debug:H,subpackages:te._subpackages};"android-instant"===t.platform&&(i.server=t["android-instant"].REMOTE_SERVER_ROOT),R(i,function(t,s,i){t?M(t):(se=s,ie=i,e())})});let ne=null;function ae(e,s){var i=[ee.template_shares,e];return C.src(i).pipe(q(t)).pipe(C.dest(Z)).on("end",s)}C.task("compress-settings",function(){if(H)return;let e={};(function(){let t=se.uuids=[],s={};function i(i){var n=(s[i]||0)+1;s[i]=n,n>=2&&!(i in e)&&(e[i]=t.length,t.push(i))}let n=se.rawAssets;for(let e in n){let t=n[e];for(let e in t)i(e)}let a=se.scenes;for(let e=0;e<a.length;++e)i(a[e].uuid);let r=se.packedAssets;for(let e in r)r[e].forEach(i);let o=se.subpackages;for(let e in o)o[e].uuids&&o[e].uuids.forEach(i);let l=se.md5AssetsMap;for(let e in l){let t=l[e];for(let e=0;e<t.length;e+=2)i(t[e])}t.sort((e,t)=>s[t]-s[e]),t.forEach((t,s)=>e[t]=s)})();let s=se.rawAssets,i=se.rawAssets={};for(let t in s){let a=s[t],r=i[t]={};for(let t in a){var n=a[t];let s=e[t];void 0!==s&&(t=s),r[t]=n}}let a=se.scenes;for(let t=0;t<a.length;++t){let s=a[t],i=e[s.uuid];void 0!==i&&(s.uuid=i)}let r=se.packedAssets;for(let t in r){let s=r[t];for(let t=0;t<s.length;++t){let i=e[s[t]];void 0!==i&&(s[t]=i)}}let o=se.subpackages;for(let t in o){let s=o[t].uuids;if(s)for(let t=0;t<s.length;++t){let i=e[s[t]];void 0!==i&&(s[t]=i)}}if(t.md5Cache){let t=se.md5AssetsMap;for(let s in t){let i=t[s];for(let t=0;t<i.length;t+=2){let s=e[i[t]];void 0!==s&&(i[t]=s)}}ne=function(e){var t=e.uuids,s=e.md5AssetsMap;for(var i in s)for(var n=s[i],a=0;a<n.length;a+=2)"number"==typeof n[a]&&(n[a]=t[n[a]])}}}),C.task("build-web-desktop-template",function(e){ae(ee.template_web_desktop,e)}),C.task("build-web-mobile-template",function(e){ae(ee.template_web_mobile,e)}),C.task("build-fb-instant-games-template",function(e){ae(ee.template_instant_games,e)}),C.task("build-plugin-scripts",["build-settings"],function(){Editor.log("Start building plugin scripts");var t=Editor.assetdb,s=[];for(var i in ie){var n=ie[i];let l=t.uuidToFspath(n);var a=e.dirname(e.join(ee.src,i));console.log(`start gulpping ${l} to ${a}`);var r=C.src(l);if(!H){var o=Editor.require("unpack://engine/gulp/util/utils").uglify;r=r.pipe(o("build",{jsb:Q&&!V,runtime:V,debug:H,wechatgame:$,qqplay:X,baidugame:I})),d.obj([r]).on("error",function(e){M(e.message)})}r=r.pipe(C.dest(a)).on("end",()=>{console.log("finish gulpping",l)}),s.push(r)}return s.length>0?u.merge(s).on("end",()=>{Editor.log("Finish building plugin scripts")}):null}),C.task("copy-main-js",function(){return C.src([e.join(ee.tmplBase,"shares/main.js")]).pipe(q(t)).pipe(C.dest(Z))}),C.task("import-script-statically",function(t){var i,n=e.join(Z,"main.js"),a=s.readFileSync(n,"utf8");if(X&&se.jsList&&se.jsList.length>0){i="\n// plugin script code\n";var r=ee.src;if(se.jsList.map(t=>{let s=e.relative(Z,e.resolve(r,t));Editor.isWin32&&(s=s.replace(/\\/g,"/")),i+=`BK.Script.loadlib('GameRes://${s}'); \n`}),i=a.replace("<Inject plugin code>",i),se.jsList=void 0,i===a)return t("Inject plugin code failure for qqplay"),void 0}else i=a.replace("<Inject plugin code>","");s.writeFileSync(n,i),t()}),C.task("copy-build-template",function(i){Editor.Ipc.sendToMain("builder:state-changed","copy-build-templates",.98);let n=e.basename(t.dest),a=e.join(t.project,"build-templates");if(!s.existsSync(a))return i();let o=e.join(a,n,"**");r(o,(n,r)=>{(r=r.map(t=>e.resolve(t))).forEach(i=>{let n=e.relative(a,i),r=e.join(t.buildPath,n);s.ensureDirSync(e.dirname(r)),s.copySync(i,r)}),i&&i(n)})}),C.task("build-common",["compile","build-assets","build-settings","build-plugin-scripts"]);var re=require(Editor.url("unpack://engine/gulp/tasks/engine"));function oe(e){let t=h.createHash("md5");for(let i=0;i<e.length;i++){let n;try{n=s.readFileSync(e[i])}catch(e){Editor.error(e);continue}t.update(n)}let i=t.digest("hex");return i=i.slice(0,O)}function le(t){let i=oe(t),n=t,a=[],r=t[0],o=Editor.Utils.UuidUtils.getUuidFromLibPath(r),l=e.dirname(r);return e.basenameNoExt(l)===o&&(n=[l]),n.forEach(e=>{let t=e.replace(Editor.Utils.UuidUtils.Reg_UuidInLibPath,e=>e+"."+i);try{s.renameSync(e,t)}catch(e){c.log(`[31m[MD5 ASSETS] write file error: ${e.message}[0m`)}a.push(t)}),{hash:i,renamedPaths:a}}async function ce(t){const s=Editor.Utils.UuidUtils.getUuidFromLibPath;var i=await n(r)(t,{nodir:!0});let a={};for(let t=0;t<i.length;t++){let n=i[t],r=s(e.relative(Z,n));r?(a[r]||(a[r]=[]),a[r].push(n)):Editor.warn(`Can not resolve uuid for path "${n}", skip the MD5 process on it.`)}for(let e in a){let t=a[e];t=t.sort(),a[e]=le(t).hash}return a}function ue(t){if(t.jsList&&t.jsList.length>0){var i=ee.src,n=t.jsList.map(t=>e.resolve(i,t)).map(t=>{return t=function(t){let i=oe([t]),n=e.join(e.dirname(t),e.basenameNoExt(t)+"."+i+e.extname(t));try{s.renameSync(t,n)}catch(e){c.log(`[31m[MD5 ASSETS] write file error: ${e.message}[0m`)}return n}(t),e.relative(i,t).replace(/\\/g,"/")});n.sort(),t.jsList=n}}function de(){const t=Editor.require("app://editor/share/engine-extends/json-packer");let i=Editor.Utils.UuidUtils.compressUuid,n=r.sync(e.join(ee.res,"import/**"),{nodir:!0}),a=new t;for(let t=0;t<n.length;++t){let r=n[t],o=e.extname(r);if(".json"!==o)continue;let l=s.readJsonSync(r),c=i(e.basename(r,o),!0);a.add(c,l),b.sync(r,{force:!0})}return a.pack()}C.task("build-cocos2d",function(i){Editor.Ipc.sendToAll("builder:state-changed","cut-engine",0);let n=Z;Q?n=e.join(Z,"src"):$&&(n=e.join(Z,"cocos")),s.ensureDirSync(ee.jsCacheDir),t.excludedModules=t.excludedModules?t.excludedModules.sort():[],Editor.assetdb.queryAssets(null,"typescript",(e,a)=>{if(e)return i(e),void 0;let r=t.excludedModules.indexOf("TypeScript Polyfill");-1===r&&0===a.length?t.excludedModules.push("TypeScript Polyfill"):r>-1&&a.length>0&&t.excludedModules.splice(r,1);let o=!1;if(s.existsSync(ee.jsCacheExcludes)){let e=s.readJSONSync(ee.jsCacheExcludes);e.excludes&&e.version&&(o=Editor.versions.cocos2d===e.version&&N===e.nativeRenderer&&e.excludes.toString()===t.excludedModules.toString()&&e.sourceMaps===t.sourceMaps)}function c(){let e=[ee.jsCache];z&&e.push(ee.jsCache+".map");let t=C.src(e);return Q&&(t=t.pipe(l(V?"cocos2d-runtime.js":"cocos2d-jsb.js"))),t=t.pipe(C.dest(n))}if(o&&s.existsSync(ee.jsCache))return c().on("end",i),void 0;(async function(e,s){var i=Q?V?"buildRuntime":"buildJsb":"buildCocosJs";if(i+=H?"":"Min",t.excludedModules.length>0){let e=null;if(P?e=["WebGL Renderer","Canvas Renderer"]:"baidugame-subcontext"===B&&(e=["Canvas Renderer"]),e&&e.length>0){let s=!1;for(let i=0;i<e.length;i++){let n=t.excludedModules.indexOf(e[i]);n>-1&&(t.excludedModules.splice(n,1),s=!0)}if(s){let e=Editor.Profile.load("profile://project/project.json");e.data["excluded-modules"]=t.excludedModules,e.save();let s=$?"BUILDER.openDataContext.webgl_module":"BUILDER.openDataContext.canvas_module";Editor.warn(Editor.T(s))}}}let n=re.excludeAllDepends(t.excludedModules);console.log("Exclude modules: "+n),re[i](Editor.url("unpack://engine/index.js"),e,n,{wechatgame:$,baidugame:I,qqplay:X,runtime:V,nativeRenderer:N,wechatgameSub:P,minigame:"mini-game"===B},s,t.sourceMaps)})(ee.jsCache,function(){c().on("end",()=>{s.writeFileSync(ee.jsCacheExcludes,JSON.stringify({excludes:t.excludedModules,version:Editor.versions.cocos2d,nativeRenderer:N,sourceMaps:t.sourceMaps}),null,4),i()})})})}),C.task("copy-webDebugger",function(){var i=e.join(Z,e.basename(ee.webDebuggerSrc));return t.embedWebDebugger?n(s.copy)(ee.webDebuggerSrc,i):b(i,{force:!0})}),C.task("revision-res-jsList",async function(){const s=Editor.Utils.UuidUtils.compressUuid;if(t.md5Cache){console.time("revision");let t=[],i=await ce(e.join(ee.res,"import","**"));for(let e in i)t.push(s(e,!0),i[e]);let n=[e.join(ee.res,"raw-assets","**")];for(let t in te._subpackages){let s=te._subpackages[t],i=e.join(ee.subpackages,s.name,"raw-assets","**");n.push(i)}let a=[],r=await ce(n);for(let e in r)a.push(s(e,!0),r[e]);se.md5AssetsMap={import:t,"raw-assets":a},te._md5Map=i,te._nativeMd5Map=r,ue(se),console.timeEnd("revision")}}),C.task("save-settings",function(e){var t=_(se,H);ne&&(t+=`(${ne.toString()})(${x});`),s.writeFile(ee.settings,t,e)}),C.task("revision-other",function(s){if(t.md5Cache){var i=Z,n=["index.html"];Q&&(n=n.concat(["main.js","cocos-project-template.json","project.json"]));var a=[],r=[e.relative(i,ee.bundledScript)];$||I||W||J?(n=n.concat(["game.js","game.json","project.config.json","project.swan.json","index.js"]),r=r.concat(["game.json","project.config.json","subdomain.json.js","project.swan.json"])):X&&(n=n.concat(["main.js","project.dev.js","project.js","settings.js","gameConfig.json","inviteIcon.png"])),(W||J)&&(a=a.concat(["main.js","project.dev.js","project.js","settings.js","babel.config.js","boot.js","manifest.json","package.json","cocos2d-js-min.js.map","cocos2d-js.js.map"])),($||I||X||W||J)&&(a=a.concat(["cocos2d-js-min.js","cocos2d-js.js"])),"fb-instant-games"===t.platform&&(n=n.concat(["fbapp-config.json"])),Editor.isWin32&&(r=r.map(e=>e.replace(/\\/g,"/"))),C.src(["src/*.js","*"],{cwd:Z,base:i}).pipe(m.revision({debug:!0,hashLength:O,dontGlobal:a,dontRenameFile:n,dontSearchFile:r,annotator:function(e,t){return[{contents:e,path:t}]},replacer:function(t,s,i,n){".map"===e.extname(t.path)&&n.revPathOriginal+".map"!==t.path||(t.contents=t.contents.replace(s,"$1"+i+"$3$4"))}})).pipe(g()).pipe(C.dest(Z)).on("end",s)}else s()}),C.task("finish-build",T("copy-build-template","import-script-statically","subpackages-assets","before-change-files","revision-res-jsList","compress-settings","save-settings","revision-other")),function(){let t=null;C.task("pack-wechatgame-subdomain",function(){t=de(),b.sync(e.join(Z,"game.json"),{force:!0}),b.sync(e.join(Z,"project.config.json"),{force:!0});let i=e.join(Z,"game.js"),n=s.readFileSync(i,"utf8"),a='SUBCONTEXT_ROOT = "'+U+'"';n=n.replace(/SUBCONTEXT_ROOT = ""/g,a),s.writeFileSync(e.join(Z,"index.js"),n),b.sync(i,{force:!0});let r=Editor.url("packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js"),o=e.join(Z,"libs/sub-context-adapter.js");s.copySync(r,o)}),C.task("extend-settings-wechat-subdomain",function(){se.packedAssets={WECHAT_SUBDOMAIN:t.indices};let i=`module.exports = ${t.data};\n`;s.writeFileSync(e.join(ee.src,"subdomain.json.js"),i),t=null}),C.task("pack-baidugame-subdomain",function(){t=de(),b.sync(e.join(Z,"game.json"),{force:!0}),b.sync(e.join(Z,"project.swan.json"),{force:!0});let i=e.join(Z,"game.js"),n=s.readFileSync(i,"utf8"),a='SUBCONTEXT_ROOT = "'+U+'"';n=n.replace(/SUBCONTEXT_ROOT = ""/g,a),s.writeFileSync(e.join(Z,"index.js"),n),b.sync(i,{force:!0});let r=Editor.url("packages://baidu-adapter/baidugame/libs/sub-context-adapter.js"),o=e.join(Z,"libs/sub-context-adapter.js");s.copySync(r,o)}),C.task("extend-settings-baidu-subdomain",function(){se.packedAssets={BAIDU_SUBDOMAIN:t.indices};let i=`module.exports = ${t.data};\n`;s.writeFileSync(e.join(ee.src,"subdomain.json.js"),i),t=null})}(),C.task("subpackages-assets",function(t){Q&&s.ensureDirSync(ee.subpackages),Editor.assetdb.queryMetas("db://assets/**","folder",async(i,a)=>{if(i)return Editor.error(i);function r(e){let t={};for(let s=0;s<e.length;++s){let i=e[s];if(te.containsAsset(i.uuid)){let e=te.getDependencies(i.uuid);e.length>0&&(t[e[0]]=!0)}}return Object.keys(t)}async function o(t){let s=null,i=null;try{s=await n(Editor.assetdb.queryAssets.bind(Editor.assetdb))(t,null),i=await async function(t){let s=t.filter(e=>"auto-atlas"===e.type),i=[];for(let t=0;t<s.length;++t){let a=e.dirname(s[t].url),o=[];try{o=await n(Editor.assetdb.queryAssets.bind(Editor.assetdb))(a+"/**/*","sprite-frame")}catch(e){throw e}let l=r(o);i=i.concat(l)}return i}(s)}catch(e){return Editor.error(e),[]}let a=(s=s.filter(e=>"javascript"!==e.type&&"typescript"!==e.type&&"folder"!==e.type)).map(e=>e.uuid).concat(i);return f.uniq(a)}a=a.filter(e=>e.isSubpackage);for(let i=0;i<a.length;++i){let r=a[i],l=Editor.assetdb.uuidToFspath(r.uuid),c=r.subpackageName||e.basenameNoExt(l),u=(e.join("subpackage",c),Editor.assetdb.uuidToUrl(r.uuid)+"/**/*"),d=null;try{d=await o(u)}catch(e){return t(e)}let p=e.join(ee.subpackages,c)+"/";for(let i=0;i<d.length;++i){let a=d[i],r=te.containsAsset(a)&&te.getNativeAssetPath(a);if(!r)continue;let o=e.relative(ee.res,r),l=e.join(p,o);try{await n(s.move)(r,l)}catch(e){return t(e)}te._buildAssets[a].nativePath=l;let u=te._subpackages[c];u&&(u.uuids||(u.uuids=[]),-1===u.uuids.indexOf(a)&&u.uuids.push(a))}}t()})}),C.task("copy-wechatgame-files",function(){var i=Editor.url("packages://weapp-adapter/wechatgame/libs/weapp-adapter/");var n=[Editor.url("packages://weapp-adapter/wechatgame/**/*"),`!${Editor.url("packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js")}`];return F||n.push(`!${Editor.url("packages://weapp-adapter/wechatgame/cocos/signature.json")}`),C.src(n).pipe(u.through(function(n){var a=e.basename(n.path),r=e.contains(i,n.path);if("game.js"===a){var o=n.contents.toString(),l='REMOTE_SERVER_ROOT = "'+t.wechatgame.REMOTE_SERVER_ROOT+'"';o=o.replace(/REMOTE_SERVER_ROOT = ""/g,l);let e=`require('cocos/${se.debug?"cocos2d-js.js":"cocos2d-js-min.js"}')`;F&&(e="requirePlugin('cocos')"),o=o.replace("require('cocos2d-js-path')",e),n.contents=new Buffer(o)}else if("game.json"===a){let e=JSON.parse(n.contents.toString());if(e.deviceOrientation=t.wechatgame.orientation,t.wechatgame.subContext&&!P?e.openDataContext=t.wechatgame.subContext:delete e.openDataContext,F){e.plugins.cocos.version=Editor.versions.CocosCreator}else delete e.plugins;if(te._subpackages){e.subpackages=[];for(let t in te._subpackages)e.subpackages.push({name:t,root:te._subpackages[t].path})}n.contents=new Buffer(JSON.stringify(e,null,2))}else if("signature.json"===a){let t=JSON.parse(n.contents.toString()),i=t.signature[0];const a=s.readFileSync(e.join(Z,"cocos","cocos2d-js-min.js"));let r=h.createHash("md5").update(a).digest("hex");i.md5=r,n.contents=new Buffer(JSON.stringify(t,null,2))}else if("project.config.json"===a){let e=JSON.parse(n.contents.toString());e.appid=t.wechatgame.appid||"wx6ac3f5090a6b99c5",e.projectname=U,n.contents=new Buffer(JSON.stringify(e,null,2))}else if(".js"===e.extname(a)&&r){var c;try{c=require("babel-core").transform(n.contents.toString(),{ast:!1,highlightCode:!1,sourceMaps:!1,compact:!1,filename:n.path,presets:["env"],plugins:["transform-decorators-legacy","transform-class-properties","transform-export-extensions","add-module-exports"]})}catch(e){return e.stack=`Compile ${a} error: ${e.stack}`,this.emit("error",e)}n.contents=new Buffer(c.code)}this.emit("data",n)})).pipe(C.dest(Z))}),C.task("copy-baidugame-files",function(){var s=Editor.url("packages://baidu-adapter/baidugame/libs/adapter/");var i=[Editor.url("packages://baidu-adapter/baidugame/**/*"),"!"+Editor.url("packages://baidu-adapter/baidugame/libs/sub-context-adapter.js")];return C.src(i).pipe(u.through(function(i){var n=e.basename(i.path),a=e.contains(s,i.path);if("game.js"===n){var r=i.contents.toString(),o='REMOTE_SERVER_ROOT = "'+t.baidugame.REMOTE_SERVER_ROOT+'"';r=r.replace(/REMOTE_SERVER_ROOT = ""/g,o),i.contents=new Buffer(r)}else if("game.json"===n){let e=JSON.parse(i.contents.toString());if(e.deviceOrientation=t.baidugame.orientation,t.baidugame.subContext&&!L?e.openDataContext=t.baidugame.subContext:delete e.openDataContext,te._subpackages){e.subpackages=[];for(let t in te._subpackages)e.subpackages.push({name:t,root:te._subpackages[t].path})}i.contents=new Buffer(JSON.stringify(e,null,4))}else if("project.swan.json"===n){let e=JSON.parse(i.contents.toString());e.appid=t.baidugame.appid||"testappid",e.projectname=U,i.contents=new Buffer(JSON.stringify(e,null,4))}else if(".js"===e.extname(n)&&a){var l;try{l=require("babel-core").transform(i.contents.toString(),{ast:!1,highlightCode:!1,sourceMaps:!1,compact:!1,filename:i.path,presets:["env"],plugins:["transform-decorators-legacy","transform-class-properties","transform-export-extensions","add-module-exports"]})}catch(e){return e.stack=`Compile ${n} error: ${e.stack}`,this.emit("error",e)}i.contents=new Buffer(l.code)}this.emit("data",i)})).pipe(C.dest(Z))}),C.task("copy-qqplay-files",function(){var t=[Editor.url("packages://qqplay-adapter/qqplay/**/*")];return C.src(t).pipe(u.through(function(t){if("gameConfig.json"===e.basename(t.path)){let e=JSON.parse(t.contents.toString());e.viewMode={portrait:1,"landscape left":2,"landscape right":3}[G],t.contents=new Buffer(JSON.stringify(e,null,4))}this.emit("data",t)})).pipe(C.dest(Z))}),C.task("before-change-files",function(e){let s=require(Editor.url("app://editor/share/build-utils"));Editor.Builder.doCustomProcess("before-change-files",s.getCommonOptions(t),te,e)}),C.task("script-build-finished",function(e){let s=require(Editor.url("app://editor/share/build-utils"));Editor.Builder.doCustomProcess("script-build-finished",s.getCommonOptions(t),te,e)}),C.task(E+"web-desktop",T("build-cocos2d",["build-common","copy-webDebugger"],"build-web-desktop-template","finish-build")),C.task(E+"web-mobile",T("build-cocos2d",["build-common","copy-webDebugger"],"build-web-mobile-template","finish-build")),C.task(E+"fb-instant-games",T("build-cocos2d",["build-common","copy-webDebugger"],"build-fb-instant-games-template","finish-build")),C.task(E+"wechatgame",T("build-cocos2d","build-common","copy-main-js","copy-wechatgame-files","finish-build")),C.task(E+"wechatgame-subcontext",T("build-cocos2d","build-common","copy-main-js","copy-wechatgame-files","pack-wechatgame-subdomain","extend-settings-wechat-subdomain","finish-build")),C.task(E+"baidugame",T("build-cocos2d","build-common","copy-main-js","copy-baidugame-files","finish-build")),C.task(E+"baidugame-subcontext",T("build-cocos2d","build-common","copy-main-js","copy-baidugame-files","pack-baidugame-subdomain","extend-settings-baidu-subdomain","finish-build")),C.task(E+"qqplay",T("build-cocos2d","build-common","copy-main-js","copy-qqplay-files","finish-build")),C.task(E+"mini-game",T("build-cocos2d","build-common","script-build-finished","subpackages-assets","before-change-files","revision-res-jsList","compress-settings","save-settings","revision-other")),C.task("copy-runtime-scripts",function(){var t=e.join(Z,"src");return C.src(e.join(ee.tmplBase,"runtime/**/*.js")).pipe(C.dest(t))}),C.task("encrypt-src-js",function(i){if(H||!t.encryptJs)return i(),void 0;var n=e.join(Z,"src"),a=e.resolve(n,"../js backups (useful for debugging)");s.copy(n,a,e=>{e&&Editor.warn("Failed to backup js files for debugging.",e),y.encryptJsFiles(t,se.subpackages,i)})}),C.task("build-jsb-adapter",function(){return Editor.require("app://editor/share/build-jsb-adapter").build({rootPath:Editor.url("packages://jsb-adapter"),dstPath:e.join(Z,"jsb-adapter"),excludedModules:t.excludedModules})}),C.task("copy-native-files",T("build-common","copy-runtime-scripts","copy-main-js","finish-build","encrypt-src-js")),C.task("build-cocos-native-project",function(e){y.build(t,e)}),C.task("build-native-project",T("build-cocos-native-project","build-cocos2d","build-jsb-adapter","copy-native-files")),C.task(E+"android",["build-native-project"]),C.task(E+"ios",["build-native-project"]),C.task(E+"win32",["build-native-project"]),C.task(E+"mac",["build-native-project"]),C.task(E+"android-instant",["build-native-project"]),C.task(E+"runtime",T("build-cocos2d","copy-native-files"));var pe=E+B;if(pe in C.tasks){var me=[ee.subpackages+"/**/*"];if(Q)me.push(ee.res+"/**/*",ee.src+"/**/*");else if($&&!P&&t.wechatgame.subContext){let s="!"+e.join(Z,t.wechatgame.subContext);me.push(e.join(Z,"**/*"),s,e.join(s,"**/*"))}else if(I&&!L&&t.baidugame.subContext){let s="!"+e.join(Z,t.baidugame.subContext);me.push(e.join(Z,"**/*"),s,e.join(s,"**/*"))}else if("xiaomi"===D){let t="!"+e.join(Z,"node_modules"),s="!"+e.join(Z,"sign"),i="!"+e.join(Z,"package.json");me.push(e.join(Z,"**/*"),t,e.join(t,"**/*")),me.push(s,e.join(s,"**/*")),me.push(i)}else me.push(e.join(Z,"**/*"));Editor.log("Delete "+me),b(me,{force:!0}).then(()=>{C.start(pe,function(e){e?S(e):(Q||Editor.Ipc.sendToMain("app:update-build-preview-path",Z),S(null,te))})}).catch(S)}else{var ge=[];for(var be in C.tasks)0===be.indexOf(E)&&ge.push(be.substring(E.length));S(new Error(i("Not support %s platform, available platform currently: %s",B,ge)))}},exports.getTemplateFillPipe=q,exports.buildSettings=R;