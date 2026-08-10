(function () {
  function init() {
    var sections = document.querySelectorAll(
      "#preview-killfeed-gameplay .gameplay",
    );
    if (!sections.length) {
      return;
    }
    sections.forEach(function (gameplay) {
      setupGameplay(gameplay);
    });
  }

  function setupGameplay(gameplay) {
    var src = gameplay.getAttribute("root");
    if (!src) {
      return;
    }
    var fps = parseFloat(gameplay.getAttribute("fps")) || 24;

    var containerStart = gameplay.getAttribute("killfeed-item-start");
    var containerEnd = gameplay.getAttribute("killfeed-item-end");

    var rawItems = gameplay.querySelectorAll("killfeed-item");
    if (!rawItems.length) {
      return;
    }

    var items = [];
    for (var i = 0; i < rawItems.length; i++) {
      var el = rawItems[i];
      var start = el.getAttribute("killfeed-item-start") || containerStart;
      var end = el.getAttribute("killfeed-item-end") || containerEnd;
      var startTime = parseInt(start, 10) / fps;
      var endTime = parseInt(end, 10) / fps;
      if (isNaN(startTime) || isNaN(endTime)) {
        continue;
      }
      items.push({
        el: el,
        startTime: startTime,
        endTime: endTime,
      });
    }
    if (!items.length) {
      return;
    }

    var video = document.createElement("video");
    video.className = "gameplay-video";
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    gameplay.insertBefore(video, gameplay.firstChild);

    function childOf(item) {
      return item.el.querySelector(".killfeed-item") || item.el;
    }

    function positionItems() {
      var rootStyle = window.getComputedStyle(document.documentElement);
      var gap = parseFloat(
        rootStyle.getPropertyValue("--rkg-stack-gap"),
      );
      if (isNaN(gap) || gap <= 0) {
        gap = 12;
      }
      var bottomPos = rootStyle.getPropertyValue("--rkg-item-pos-bottom") || "";
      var stackUp = bottomPos && bottomPos.trim() !== "" && bottomPos.trim() !== "auto";
      var offset = 0;
      items.forEach(function (item) {
        var child = childOf(item);
        child.style.transform = stackUp
          ? "translateY(-" + offset + "px)"
          : "translateY(" + offset + "px)";
        offset += child.offsetHeight + gap;
      });
      return offset;
    }

    var autoPlaying = false;

    function update() {
      var time = video.currentTime;
      var playing = autoPlaying && !video.paused && !video.ended;
      items.forEach(function (item) {
        var visible;
        if (!playing) {
          visible = true;
        } else {
          visible = time >= item.startTime && time <= item.endTime;
        }
        var child = childOf(item);
        child.style.opacity = visible ? "1" : "0";
        if (child !== item.el) {
          item.el.style.opacity = "";
          item.el.style.transform = "";
        }
      });
      positionItems();
    }

    video.addEventListener("timeupdate", update);
    video.addEventListener("play", update);
    video.addEventListener("pause", update);
    video.addEventListener("play", function () {
      autoPlaying = true;
      requestAnimationFrame(update);
    });
    video.addEventListener("pause", function () {
      autoPlaying = false;
      update();
    });

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise
        .then(function () {
          autoPlaying = true;
        })
        .catch(function () {
          update();
        });
    } else {
      update();
    }

    var attempts = 0;
    var positionTimer = setInterval(function () {
      var offset = positionItems();
      attempts++;
      if (offset > 0 || attempts > 20) {
        clearInterval(positionTimer);
        update();
      }
    }, 100);

    window.addEventListener("resize", positionItems);
    video.addEventListener("loadeddata", positionItems);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();