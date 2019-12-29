"use strict";Vue.component("cc-richtext",{template:'\n    <ui-prop\n      v-prop="target.string"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.horizontalAlign"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.fontSize">\n      :multi-values="multi"\n    </ui-prop>\n    <ui-prop\n      v-prop="target.font"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.fontFamily"\n      v-show="_isSystemFont()"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.useSystemFont"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.maxWidth"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.lineHeight"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.imageAtlas"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.handleTouchEvent"\n      :multi-values="multi"\n    ></ui-prop>            \n  ',props:{target:{twoWay:!0,type:Object},multi:{type:Boolean}},methods:{T:Editor.T,_isSystemFont(){return this.target.useSystemFont.value}}});