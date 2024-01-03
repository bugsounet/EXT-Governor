/******************
*  EXT-Governor v1
*  ©Bugsounet
*  03/2022
******************/

Module.register("EXT-Governor", {
  requiresVersion: "2.22.0",
  defaults: {
    debug: false,
    sleeping: "powersave",
    working: "ondemand"
  },

  start: function() {
    this.ready = false
  },

  notificationReceived: function (notification, payload, sender) {
    if (notification == "GA_READY") {
      if (sender.name == "MMM-GoogleAssistant") this.sendSocketNotification("INIT", this.config)
    }
    if (!this.ready) return
    switch(notification) {
      case "EXT_GOVERNOR-WORKING":
        this.sendSocketNotification("WORKING")
        break
      case "EXT_GOVERNOR-SLEEPING":
        this.sendSocketNotification("SLEEPING")
        break
    }
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification == "INITIALIZED") {
      this.ready = true
      this.sendNotification("EXT_HELLO", this.name)
    }
  },

  getDom: function () {
    var dom = document.createElement("div")
    dom.style.display = 'none'
    return dom
  }
});
