(function (splashScreen) {
  var container;
  var showSplash;

  function getDevice() {
    if (
      window.innerWidth < 768 ||
      (window.innerWidth >= 768 && window.innerHeight < 450)
    )
      return "mobile";

    return "desktop";
  }

  splashScreen.show = function (opt) {
    if (showSplash) return this;

    opt = {
      title: "WILDFIRE",
      status: "Loading",
      device: getDevice(),
      ...opt,
    };

    showSplash = new Promise(function (res, rej) {
      document.addEventListener("DOMContentLoaded", function (event) {
        // console.log("Showing splash");
        container = document.createElement("div");
        container.classList.add("splash-screen");
        container.classList.add("device-" + opt.device);
        container.insertAdjacentHTML(
          "afterbegin",
          `
<div class="centered">
    <div class="logo-row">
        <div class="bc-wildfire-service-logo"></div>
        <div class="wildfire-one-logo"></div>
    </div>
    <div class="separator"></div>
    <div class="title">${opt.title}</div>
</div>
<div class="footer">
    <div class="spinner"></div>
    <div class="status" id="splash-screen-status">${opt.status}</div>
</div>
                `,
        );

        document.body.prepend(container);
        res();
      });
    });

    return this;
  };

  splashScreen.setStatus = function (status) {
    if (!showSplash) return this;

    showSplash.then(function () {
      if (!container) return;
      document.getElementById("splash-screen-status").innerText = status;
    });

    return this;
  };

  splashScreen.remove = function () {
    if (!showSplash) return this;

    showSplash.then(function () {
      if (!container) return;
      container.classList.add("hide");
      setTimeout(function () {
        container.remove();
        container = null;
      }, 3000);
    });

    return this;
  };
})(window.SPLASH_SCREEN || (window.SPLASH_SCREEN = {}));
