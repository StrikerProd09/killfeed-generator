(function () {
  function init() {
    var navToggle = document.getElementById("nav-toggle");
    var mainNav = document.querySelector(".main-nav");
    if (!navToggle || !mainNav) {
      return;
    }
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.classList.toggle("open", open);
    });
    mainNav.addEventListener("click", function () {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.classList.remove("open");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();