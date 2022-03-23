/**********************************
* node_helper for EXT-Governor v1 *
* BuGsounet ©03/22                *
**********************************/

const NodeHelper = require('node_helper')
const CPUGovernor = require("./lib/GovernorLib.js")
logGOV = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({

  start: function() {
    this.governor = null
  },

  initialize: async function() {
    if (this.config.debug) logGOV = (...args) => { console.log("[GOVERNOR]", ...args) }
    console.log("[GOVERNOR] EXT-Governor Version:", require('./package.json').version, "rev:", require('./package.json').rev )
    this.Governor()
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload
        this.initialize()
        break
      case "WORKING":
        if (this.governor) this.governor.working()
        break
      case "SLEEPING":
        if (this.governor) this.governor.sleeping()
        break
    }
  },

  Governor: function () {
    var callback= (result) => {
        logGOV("Callback:", result)
        if (result.error) console.error("[GOVERNOR] Error:", result.error)
    }
    var governorConfig= {
      useCallback: true,
      sleeping: this.config.sleeping,
      working: this.config.working
    }
    this.governor = new CPUGovernor(governorConfig, callback, this.config.debug)
    this.governor.start()
  }
});
