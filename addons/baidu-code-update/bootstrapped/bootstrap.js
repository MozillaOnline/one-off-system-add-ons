/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* eslint-disable-next-line mozilla/no-define-cc-etc, mozilla/use-cc-etc */
const Cu = Components.utils;
/* eslint-disable-next-line mozilla/use-chromeutils-import */
Cu.import("resource://gre/modules/Services.jsm");

let BaiduCodeUpdate = class {
  observe(subject, topic, data) {
    switch (topic) {
      case "browser-search-service":
        if (data !== "init-complete") {
          break;
        }

        Services.obs.removeObserver(this, "browser-search-service");
        this.overrideSearchEngine();
        break;
      default:
        break;
    }
  }

  onStartup() {
    if (Services.search.isInitialized) {
      this.overrideSearchEngine();
    } else {
      /* eslint-disable-next-line mozilla/no-useless-parameters */
      Services.obs.addObserver(this, "browser-search-service", false);
    }
  }

  overrideSearchEngine() {
    let engine = Services.search.getEngineByName("\u767e\u5ea6");
    if (!engine) {
      return;
    }

    let searchCode = "monline_7_dg";
    let shortName = "baidu-sysaddon";

    let toReplace = /^https?:\/\/www\.baidu\.com\/baidu\?wd=test&tn=monline_dg(?:&ie=utf-8)?$/;
    let testSubmission = engine.getSubmission("test", null, "searchbar");
    if (!toReplace.test(testSubmission.uri.spec)) {
      return;
    }

    engine = engine.wrappedJSObject;
    for (let url of engine._urls) {
      url.params = url.params.map(param => {
        if (param.name !== "tn") {
          return param;
        }

        return Object.assign({}, param, {value: searchCode});
      });
    }
    engine._shortName = shortName;
  }
};

function install() {}
function shutdown() {}
function startup() {
  let baiduCodeUpdate = new BaiduCodeUpdate();
  baiduCodeUpdate.onStartup();
}
function uninstall() {}
