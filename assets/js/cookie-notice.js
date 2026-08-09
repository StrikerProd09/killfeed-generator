(function () {
  function init() {
    var cookieNotice = document.getElementById("cookie-notice");
    var cookieAccept = document.getElementById("cookie-accept");

    function getConsent() {
      try {
        if (localStorage.getItem("rkg_cookie_consent") === "accepted") {
          return true;
        }
      } catch (e) {
        // ignore
      }
      return document.cookie.indexOf("rkg_cookie_consent=accepted") !== -1;
    }

    function saveConsent() {
      var expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      document.cookie =
        "rkg_cookie_consent=accepted; expires=" +
        expiry.toUTCString() +
        "; path=/";
      try {
        localStorage.setItem("rkg_cookie_consent", "accepted");
      } catch (e) {
        // localStorage unavailable; rely on document.cookie above.
      }
    }

    if (cookieNotice) {
      if (!getConsent()) {
        cookieNotice.style.display = "flex";
      }
    }
    if (cookieAccept) {
      cookieAccept.addEventListener("click", function () {
        saveConsent();
        if (cookieNotice) {
          cookieNotice.style.display = "none";
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();