"use strict";
const { ipcMain: e } = require("electron"),
  i = require("fire-fs");
(module.exports = new (class {
  async showBuildingPage(e) {
    e
      ? ((this.buildingWin = new Editor.Window("importing", {
          title: "Building Engine",
          width: 350,
          height: 120,
          alwaysOnTop: !0,
          show: !1,
          resizable: !1,
          save: !1,
          frame: !1
        })),
        this.buildingWin.load("app://editor/page/building-engine.html"),
        await new Promise(e => {
          this.buildingWin.nativeWin.once("ready-to-show", () => {
            this.buildingWin && this.buildingWin.show(), e();
          });
        }))
      : (this.buildingWin && this.buildingWin.close(),
        (this.buildingWin = null));
  }
  async build() {
    let e = Editor.require("app://editor/share/quick-compile/build-engine");
    if (
      Editor.require(
        "app://editor/share/quick-compile/check-auto-build-engine"
      )()
    )
      Editor.log(Editor.T("EDITOR_MAIN.building_engine")),
        await this.showBuildingPage(!0),
        (this.engineCompiler = await e({
          enableWatch: Editor.App._profile.data["watch-js-engine"],
          enginePath: Editor.url("unpack://engine")
        })),
        this.showBuildingPage(!1);
    else {
      let t = Editor.url("unpack://engine-dev");
      i.existsSync(t) ||
        (Editor.warn(`Can not find ${t}, force auto build engine.`),
        await this.showBuildingPage(!0),
        await e({ enginePath: Editor.url("unpack://engine") }),
        this.showBuildingPage(!1));
    }
  }
  async revertEngineDialog(e) {
    Editor.Dialog.messageBox({
      type: "error",
      buttons: [Editor.T("MESSAGE.ok")],
      message: Editor.T("EDITOR_MAIN.custom_engine_failed"),
      detail: e.stack,
      noLink: !0
    });
    let i = Editor.Profile.load("profile://local/settings.json"),
      t = Editor.Profile.load("profile://global/settings.json"),
      n = i.data;
    !1 !== i.data["use-global-engine-setting"] && (n = t.data),
      (n["use-default-js-engine"] = !0),
      i.save(),
      t.save();
  }
  async init() {
    Editor.log("Initializing Cocos2d");
    let e = Editor.Profile.load("profile://local/settings.json"),
      i = Editor.Profile.load("profile://global/settings.json"),
      t = e.data;
    !1 !== e.data["use-global-engine-setting"] && (t = i.data);
    let n = t["use-default-js-engine"];
    if (!n)
      try {
        require(Editor.url("unpack://engine-dev"));
      } catch (e) {
        this.revertEngineDialog(e), (n = !0);
      }
    if (n)
      try {
        require(Editor.url("unpack://engine-dev"));
      } catch (e) {
        throw (Editor.Dialog.messageBox({
          type: "error",
          buttons: [Editor.T("MESSAGE.ok")],
          message: Editor.T("EDITOR_MAIN.builtin_engine_failed"),
          detail: e.stack,
          noLink: !0
        }),
        new Error(Editor.T("EDITOR_MAIN.builtin_engine_failed")));
      }
  }
  async initExtends() {
    Editor.log("Initializing engine extends");
    try {
      require("../../share/engine-extends/init"),
        require("../../share/engine-extends/serialize");
    } catch (e) {
      throw (Editor.Dialog.messageBox({
        type: "error",
        buttons: ["OK"],
        title: "Initializing engine extends failed",
        message:
          "Maybe the reason is: You are using custom JS engine and it is out-dated.",
        detail: `Error call stack : ${err.stack}`,
        defaultId: 0,
        cancelId: 0,
        noLink: !0
      }),
      new Error(
        Editor.T(
          "Maybe the reason is: You are using custom JS engine and it is out-dated."
        )
      ));
    }
  }
  initSceneList() {
    Editor.assetdb.queryAssets(null, "scene", function(e, i) {
      Editor.sceneList = i.map(e => e.uuid);
    });
    let e = Editor._projectLocalProfile.data["last-edit"];
    Editor.assetdb.existsByUuid(e) ||
      ((e = Editor._projectProfile.data["start-scene"]),
      Editor.assetdb.existsByUuid(e) || (e = null),
      (Editor._projectLocalProfile.data["last-edit"] = e),
      Editor._projectLocalProfile.save()),
      (Editor.currentSceneUuid = e);
  }
})()),
  e.on("app:rebuild-editor-engine", e => {
    module.exports.engineCompiler
      ? module.exports.engineCompiler.rebuild().then(() => {
          e.reply();
        })
      : e.reply();
  }),
  e.on("migrate-project", (e, t) => {
    (function(e) {
      const t = require("semver"),
        n = require("path"),
        o = n.join(Editor.Project.path, "assets");
      e ||
        (e = (function() {
          const e = require("globby");
          let n;
          try {
            let t = e.sync(`${o}/**/*.@(png|jpg).meta`, {
              nodir: !0,
              caseSensitiveMatch: !1,
              absolute: !0
            });
            if (!(t.length > 0))
              return (
                console.warn(
                  "can not guess last project version, no texture meta found"
                ),
                void 0
              );
            n = i.readJsonSync(t[0]);
          } catch (e) {
            return console.error(e), void 0;
          }
          if (!n || !n.ver)
            return (
              console.error(
                "can not guess last project version, texture meta version is invalid"
              ),
              void 0
            );
          return t.satisfies(n.ver, "< 2.3.0", { includePrerelease: !0 })
            ? (console.log(
                "last project version must < 2.1.0 since texture meta version < 2.3.0"
              ),
              "2.0.10")
            : (console.log(
                "last project version must >= 2.1.0 since texture meta version >= 2.3.0"
              ),
              "2.1.0");
        })());
      if (e && t.satisfies(e, ">= 2.1.0 < 2.1.2", { includePrerelease: !0 }))
        try {
          const e = Editor.url(
              "unpack://static/migration/use_v2.1.x_cc.Action.js"
            ),
            t = n.join(o, "migration/use_v2.1.x_cc.Action.js");
          i.copySync(e, t);
        } catch (e) {
          console.error(e);
        }
    })(t);
  });
