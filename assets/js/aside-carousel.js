(function () {
  function stripIds(root) {
    if (root.id) {
      root.removeAttribute("id");
    }
    Array.prototype.forEach.call(
      root.querySelectorAll("[id]"),
      function (element) {
        element.removeAttribute("id");
      },
    );
  }

  function makeInert(root) {
    root.setAttribute("aria-hidden", "true");
    root.inert = true;
    Array.prototype.forEach.call(
      root.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
      function (element) {
        element.setAttribute("tabindex", "-1");
      },
    );
  }

  function setup(carousel) {
    var viewport = carousel.querySelector("[data-kg-carousel]") || carousel;
    var track = carousel.querySelector("[data-kg-carousel-track]");
    if (!track) {
      return;
    }

    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) {
      return;
    }

    var cloneSets = 0;
    var resumeTimer = null;

    function gapSize() {
      var styles = window.getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap) || 0;
    }

    function setWidth() {
      var gap = gapSize();
      return originals.reduce(function (total, item) {
        return total + item.getBoundingClientRect().width + gap;
      }, 0);
    }

    function addClones() {
      var width = setWidth();
      if (!width) {
        return;
      }
      var wanted = Math.max(
        1,
        Math.ceil(viewport.getBoundingClientRect().width / width),
      );
      while (cloneSets < wanted) {
        originals.forEach(function (item) {
          var clone = item.cloneNode(true);
          stripIds(clone);
          makeInert(clone);
          track.appendChild(clone);
        });
        cloneSets += 1;
      }
    }

    function setAnimation() {
      var width = setWidth();
      if (!width) {
        return;
      }
      track.style.setProperty("--kg-carousel-distance", width + "px");
      track.style.setProperty(
        "--kg-carousel-duration",
        Math.max(18, width / 38) + "s",
      );
      track.classList.add("is-ready");
    }

    addClones();
    setAnimation();

    viewport.addEventListener("pointerdown", function () {
      window.clearTimeout(resumeTimer);
      track.classList.add("is-paused");
    });

    viewport.addEventListener("pointerup", function () {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () {
        track.classList.remove("is-paused");
      }, 2600);
    });

    viewport.addEventListener("pointercancel", function () {
      track.classList.remove("is-paused");
    });

    viewport.addEventListener("focusin", function () {
      track.classList.add("is-paused");
    });

    viewport.addEventListener("focusout", function () {
      track.classList.remove("is-paused");
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        addClones();
        setAnimation();
      }, 180);
    });
  }

  function init() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-kg-carousel]"),
      function (element) {
        var section = element.closest(".kg-aside-carousel") || element;
        setup(section);
      },
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
