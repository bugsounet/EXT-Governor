/******************
*  EXT-Governor v1
*  ©Bugsounet
*  02/2022
******************/

Module.register("EXT-Governor", {
  requiresVersion: "2.22.0",
  defaults: {
    debug: false,
    sleeping: "powersave",
    working: "ondemand"
  },

  notificationReceived: function (notification, payload, sender) {
    switch(notification) {
      case "GW_READY":
        if (sender.name == "Gateway") this.sendSocketNotification("INIT", this.config)
        break
      case "EXT_GOVERNOR-WORKING":
        this.sendSocketNotification("WORKING")
        break
      case "EXT_GOVERNOR-SLEEPING":
        this.sendSocketNotification("SLEEPING")
        break
    }
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification == "INITIALIZED") this.sendNotification("EXT_HELLO", this.name)
  },

  getDom: function () {
    var dom = document.createElement("div")
    dom.style.display = 'none'
    return dom
  },
});
