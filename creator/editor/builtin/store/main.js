"use strict";require("fire-path"),require("async");module.exports={load(){},unload(){},messages:{async open(){Editor.Metrics.trackEvent({category:"Store",action:"Open",label:"new metrics"}),await Editor.User.isLoggedIn()?Editor.Panel.open("store"):Editor.warn("用户未登录或登录信息已丢失，请重新登陆后打开插件商城")},"check-package"(e,a){e.reply(null,Editor.Package.find(a))},"unload-package"(e,a){Editor.Package.unload(a,function(){e.reply(null)})},"load-package"(e,a){Editor.Package.load(a,function(){e.reply(null)})},"app:sign-out"(){Editor.Panel.close("store")}}};