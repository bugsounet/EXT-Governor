/*******************************
* node_helper for EXT-Governor *
* BuGsounet ©02/24             *
********************************/

const NodeHelper = require("node_helper");
const CPUGovernor = require("./components/GovernorLib.js");

var logGOV = (...args) => { /* do nothing */ };

module.exports = NodeHelper.create({
  start () {
    this.governor = null;
  },

  socketNotificationReceived (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload;
        this.initialize();
        break;
      case "WORKING":
        if (this.governor) this.governor.working();
        break;
      case "SLEEPING":
        if (this.governor) this.governor.sleeping();
        break;
    }
  },

  initialize () {
    if (this.config.debug) logGOV = (...args) => { console.log("[GOVERNOR]", ...args); };
    console.log("[GOVERNOR] EXT-Governor Version:", require("./package.json").version, "rev:", require("./package.json").rev );
    this.Governor();
  },

  Governor () {
    var callback= (result) => {
      logGOV("Callback:", result);
      if (result.error) console.error("[GOVERNOR] Error:", result.error);
    };
    var governorConfig= {
      debug: this.config.debug,
      useCallback: true,
      sleeping: this.config.sleeping,
      working: this.config.working
    };
    this.governor = new CPUGovernor(governorConfig, callback);
    this.governor.start();
    this.sendSocketNotification("INITIALIZED");
  }
});
