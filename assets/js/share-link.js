(function () {
  function copyFallback(url, done) {
    var input = document.createElement("textarea");
    input.value = url;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.top = "-1000px";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {
      window.prompt("Copy this link", url);
    }
    document.body.removeChild(input);
  }

  function init() {
    var button = document.getElementById("nav-share");
    var label = document.getElementById("nav-share-label");
    if (!button || !label) {
      return;
    }

    button.addEventListener("click", function () {
      var url = window.location.href;

      function done() {
        label.classList.add("show");
        clearTimeout(button._shareTimer);
        button._shareTimer = setTimeout(function () {
          label.classList.remove("show");
        }, 1600);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {
          copyFallback(url, done);
        });
      } else {
        copyFallback(url, done);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
