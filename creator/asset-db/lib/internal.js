"use strict";require("async");const t=require("del"),e=require("fire-path"),i=require("fire-url"),s=require("fire-fs"),u=require("./meta");module.exports={_MOUNT_PREFIX:"mount-",_dbpath(t){let e,s=[].slice.call(arguments,1),u=i.join.apply(i,s);for(e=0;e<u.length&&"/"===u[e];++e);return u=u.substr(e),i.format({protocol:t,host:u,slashes:!0})},_fspath(t){if(!t)return null;if(0!==t.indexOf("db://"))return null;let i=t.substring(5),s=i.split("/"),u="",h=null;for(let t=0;t<s.length;++t){u=e.join(u,s[t]);let i=this._mounts[u];if(!i)break;h=i}return h?(i=e.relative(h.mountPath,i),e.resolve(e.join(h.path,i))):null},_url(t){if(!t)return null;for(let s in this._mounts){let u=this._mounts[s].path;if(e.contains(u,t))return i.normalize(`db://${s}/${e.relative(u,t)}`)}return i.normalize("file://"+t)},_allPaths(){return this._pathsDirty&&(this._paths=Object.keys(this._path2uuid),this._paths.sort(),this._pathsDirty=!1),this._paths},_metaToAssetPath(t){let i=e.basename(t,".meta");return e.join(e.dirname(t),i)},_isMountPath(t){let i=e.resolve(t);for(let t in this._mounts)if(this._mounts[t].path===i)return!0;return!1},_isAssetPath(t){if(!t)return!1;for(let i in this._mounts){let s=this._mounts[i].path;if(e.contains(s,t))return!0}return!1},_mountIDByMountPath(t){return this._mounts[t]?this._MOUNT_PREFIX+t:""},_mountIDByPath(t){for(let e in this._mounts)if(this._mounts[e].path===t)return this._MOUNT_PREFIX+e;return""},_mountPaths(){let t=[];for(let e in this._mounts)t.push(this._mounts[e].path);return t},_uuidToImportPathNoExt(t){return e.join(this._importPath,t.substring(0,2),t)},_fspathToImportPathNoExt(t){let e=this.fspathToUuid(t);return e?this._uuidToImportPathNoExt(e):null},_getDestPathByMeta(t){if(t.useRawfile())return null;let e=t.dests();if(!e.length)return null;let i=e[0];return s.existsSync(i)?i:null},async _rmMetas(){for(let i in this._mounts){let s=this._mounts[i].path;await t(e.join(s,"**/*.meta"),{force:!0})}},_dbAdd(t,e){return this._uuid2path[e]?(this.failed(`uuid collision, the uuid for ${t} is already in used by ${this._uuid2path[e]}. This resource is about to be ignored.`),void 0):this._path2uuid[t]?(this.failed(`path collision, the path for ${e} is already in used by ${this._path2uuid[t]}. This resource is about to be ignored.`),void 0):(this._path2uuid[t]=e,this._uuid2path[e]=t,this._pathsDirty=!0,void 0)},_dbMove(t,e){let i=this._path2uuid[t];delete this._path2uuid[t],this._path2uuid[e]=i,this._uuid2path[i]=e,this._pathsDirty=!0},_dbDelete(t){let e=this._path2uuid[t];delete this._path2uuid[t],delete this._uuid2path[e],delete this._uuid2meta[e],this._pathsDirty=!0},_dbReset(){this._mounts={},this._uuid2mtime={},this._uuid2path={},this._path2uuid={}},_handleRefreshResults(t){if(!this._eventCallback)return;let e=[],i=[];t.forEach(t=>{t.error||("uuid-change"===t.command?this._dispatchEvent("asset-db:asset-uuid-changed",{type:t.type,uuid:t.uuid,oldUuid:t.oldUuid}):"change"===t.command?this._dispatchEvent("asset-db:asset-changed",{type:t.type,uuid:t.uuid}):"create"===t.command?i.push({path:t.path,url:t.url,uuid:t.uuid,parentUuid:t.parentUuid,type:t.type,hidden:t.hidden,readonly:t.readonly,name:t.name}):"delete"===t.command&&e.push({path:t.path,url:t.url,uuid:t.uuid,type:t.type}))}),e.length>0&&this._dispatchEvent("asset-db:assets-deleted",e),i.length>0&&this._dispatchEvent("asset-db:assets-created",i),this._handleErrorResults(t)},_handleErrorResults(t){this._eventCallback&&t.forEach(t=>{t.error&&"ESCRIPTIMPORT"===t.error.code&&this._dispatchEvent("asset-db:script-import-failed",t)})},_handleMetaBackupResults(t){this._eventCallback&&t.length>0&&this._dispatchEvent("asset-db:meta-backup",t)},_ensureDirSync(t){if(!e.isAbsolute(t))return[];let i=[];for(s.ensureDirSync(t);!this._isMountPath(t);){if(s.isDirSync(t)){let e=t+".meta";if(!s.existsSync(e)){let s=u.create(this,e);u.save(this,e,s),this._dbAdd(t,s.uuid),i.splice(0,0,s)}}t=e.dirname(t)}return i},_dispatchEvent(t,e){this._eventCallback&&this._eventCallback(t,e)}};