/**********************************
* node_helper for EXT-Governor v1 *
* BuGsounet ©02/22                *
**********************************/

const NodeHelper = require('node_helper')

logGOV = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({

  start: function() {
    this.lib = {}
    this.governor = null
  },

  initialize: async function() {
    if (this.config.debug) logGOV = (...args) => { console.log("[GOVERNOR]", ...args) }
    console.log("[GOVERNOR] EXT-Governor Version:", require('./package.json').version, "rev:", require('./package.json').rev )
    /** check if update of npm Library needed **/
    let bugsounet = await this.loadBugsounetLibrary()
    if (bugsounet) {
      console.error("[GOVERNOR] Warning:", bugsounet, "needed @bugsounet library not loaded !")
      console.error("[GOVERNOR] Try to solve it with `npm run rebuild` in EXT-Governor directory")
      return
    }
    else {
      console.log("[GOVERNOR] All needed @bugsounet library loaded !")
    }
    if (this.config.NPMCheck.useChecker) {
      var cfg = {
        dirName: __dirname,
        moduleName: this.name,
        timer: this.config.NPMCheck.delay,
        debug: this.config.debug
      }
      new this.lib.npmCheck(cfg, update => { this.sendSocketNotification("NPM_UPDATE", update)} )
    }
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
    this.governor = new this.lib.Governor(governorConfig, callback, this.config.debug)
    this.governor.start()
  },

  /** Load require @busgounet library **/
  /** It will not crash MM (black screen) **/
  loadBugsounetLibrary: function() {
    let libraries= [
      // { "library to load" : [ "store library name", "path to check"] }
      { "@bugsounet/npmcheck": [ "npmCheck", "NPMCheck.useChecker" ] },
      { "@bugsounet/governor": [ "Governor", "sleeping" ] },
    ]
    let errors = 0
    return new Promise(resolve => {
      libraries.forEach(library => {
        for (const [name, configValues] of Object.entries(library)) {
          let libraryToLoad = name,
              libraryName = configValues[0],
              libraryPath = configValues[1],
              index = (obj,i) => { return obj[i] },
              libraryActivate = libraryPath.split(".").reduce(index,this.config)

          // libraryActivate: verify if the needed path of config is activated (result of reading config value: true/false) **/
          if (libraryActivate) {
            try {
              if (!this.lib[libraryName]) {
                this.lib[libraryName] = require(libraryToLoad)
                logGOV("Loaded " + libraryToLoad)
              }
            } catch (e) {
              console.error("[GOVERNOR]", libraryToLoad, "Loading error!" , e)
              this.sendSocketNotification("WARNING" , {library: libraryToLoad })
              errors++
            }
          }
        }
      })
      resolve(errors)
    })
  }
});
