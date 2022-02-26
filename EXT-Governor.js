/******************
*  EXT-Governor v1
*  ©Bugsounet
*  02/2022
******************/

Module.register("EXT-Governor", {
  requiresVersion: "2.18.0",
  defaults: {
    debug: false,
    sleeping: "powersave",
    working: "ondemand"
  },

  notificationReceived: function (notification, payload) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.config)
        this.sendNotification("EXT_HELLO", this.name)
        break
      case "EXT_GOVERNOR-WORKING":
        this.sendSocketNotification("WORKING")
        break
      case "EXT_GOVERNOR-SLEEPING":
        this.sendSocketNotification("SLEEPING")
        break
    }
  },

  getDom: function () {
    var dom = document.createElement("div")
    dom.style.display = 'none'
    return dom
  },
});
