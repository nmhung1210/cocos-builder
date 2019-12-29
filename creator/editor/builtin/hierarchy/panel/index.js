"use strict";const e=require("fire-fs"),t=(require("fire-path"),Editor.require("packages://hierarchy/panel/utils/event")),n=Editor.require("packages://hierarchy/panel/utils/cache"),o=Editor.require("packages://hierarchy/panel/utils/operation"),r=Editor.require("packages://hierarchy/panel/manager"),i=Editor.require("packages://hierarchy/panel/utils/communication");function l(e){let t=Editor.Selection.curSelection("node");Editor.Ipc.sendToWins("scene:center-nodes",t),s(t,e)}function s(e,t){let r=e[e.length-1];if(!r)return;let i=n.queryNode(r);i&&(o.foldAllParentNodeState(i,!1),requestAnimationFrame(()=>{let e=20*i.showIndex,n=t.clientHeight,o=t.scrollTop;e>o+n-20?t.scrollTop=e-n+20:e<o&&(t.scrollTop=e)}))}Editor.Panel.extend({listeners:{"panel-resize"(){this._vm.length=(this.clientHeight-56)/20+3}},style:e.readFileSync(Editor.url("packages://hierarchy/panel/style/index.css")),template:e.readFileSync(Editor.url("packages://hierarchy/panel/template/index.html")),messages:{"scene:ready"(){r.startup()},"scene:reloading"(){r.stop()},"selection:selected"(e,t,n){"node"===t&&(n.forEach(e=>{o.select(e,!0)}),s(n,this._vm.$els.nodes))},"selection:unselected"(e,t,n){"node"===t&&n.forEach(e=>{o.select(e,!1)})},"scene:animation-record-changed"(e,t,n){i.setRecord(!!t),o.ignore(n,t)},"change-filter"(e,t){this._vm.filter=t},delete(e,t){Editor.Selection.unselect("node",t,!0),Editor.Ipc.sendToPanel("scene","scene:delete-nodes",t)},rename(e,t){o.rename(t)},"show-path"(e,t){o.print(t)},duplicate(e,t){Editor.Ipc.sendToPanel("scene","scene:duplicate-nodes",t)},filter(e,t){this._vm.filter=t},hint(e,t){o.hint(t)},"hierarchy:hint"(e,t){o.hint(t)}},ready(){this._vm=function(e,n){return new Vue({el:e,data:{length:0,filter:""},watch:{},methods:{},components:{tools:Editor.require("packages://hierarchy/panel/component/tools"),nodes:Editor.require("packages://hierarchy/panel/component/nodes"),search:Editor.require("packages://hierarchy/panel/component/search")},created(){Editor.Ipc.sendToPanel("scene","scene:is-ready",(e,t)=>{t&&r.startup()},-1),t.on("filter-changed",e=>{this.filter=e,""===e&&l(this.$els.nodes)}),t.on("empty-filter",()=>{l(this.$els.nodes)})}})}(this.shadowRoot),this._vm.length=(this.clientHeight-56)/20+3,n.initNodeState(),n.initNodeStateProfile()},close(){n.saveNodeTreeStateProfile()},selectAll(e){e&&(e.stopPropagation(),e.preventDefault());let t=[];n.queryNodes().forEach(e=>{t.push(e.id),e.children.length>0&&o.fold(e.id,!1)}),Editor.Selection.select("node",t,!0,!1)},delete(e){e&&(e.stopPropagation(),e.preventDefault());let t=[];n.queryNodes().forEach(e=>{e.selected&&t.push(e.id)}),Editor.Selection.unselect("node",t,!0),Editor.Ipc.sendToPanel("scene","scene:delete-nodes",t)},up(e){e&&(e.stopPropagation(),e.preventDefault());let t=n.queryNodes();for(let e=0;e<t.length;e++){let n=t[e],o=n.showIndex;if(n&&n.selected){for(e;e>=0;e--){let n=t[e];if(n.showIndex>=0&&n.showIndex<o){Editor.Selection.select("node",n.id,!0,!0);break}}break}}},down(e){e&&(e.stopPropagation(),e.preventDefault());let t=n.queryNodes();for(let e=t.length-1;e>=0;e--){let n=t[e],o=n.showIndex;if(n&&n.selected){for(e;e<t.length;e++){let n=t[e];if(n.showIndex>o){Editor.Selection.select("node",n.id,!0,!0);break}}break}}},left(e){e&&(e.stopPropagation(),e.preventDefault()),n.queryNodes().forEach(e=>{e.selected&&o.fold(e.id,!0)})},right(e){e&&(e.stopPropagation(),e.preventDefault()),n.queryNodes().forEach(e=>{e.selected&&o.fold(e.id,!1)})},shiftUp(){},shiftDown(){},f2(e){e&&(e.stopPropagation(),e.preventDefault());let t=n.queryNodes();for(let e=0;e<t.length;e++){let n=t[e];if(n&&n.selected){o.rename(n.id,!0);break}}},find(e){e&&(e.stopPropagation(),e.preventDefault());let t=Editor.Selection.curSelection("node");Editor.Ipc.sendToWins("scene:center-nodes",t)},copy(){let e=Editor.Selection.curSelection("node");Editor.Ipc.sendToPanel("scene","scene:copy-nodes",e)},paste(){let e=Editor.Selection.curActivate("node"),t=n.queryNode(e);t&&t.parent&&(e=t.parent),Editor.Ipc.sendToPanel("scene","scene:paste-nodes",e)},duplicate(){let e=Editor.Selection.curSelection("node");e.length>0&&Editor.Ipc.sendToPanel("hierarchy","duplicate",e)}});