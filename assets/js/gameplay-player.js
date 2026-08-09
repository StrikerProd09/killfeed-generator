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
      var offset = 0;
      items.forEach(function (item) {
        var child = childOf(item);
        child.style.transform = "translateY(" + offset + "px)";
        offset += child.offsetHeight + 6;
      });
      return offset;
    }

    function update() {
      var time = video.currentTime;
      items.forEach(function (item) {
        var visible = time >= item.startTime && time <= item.endTime;
        childOf(item).style.opacity = visible ? "1" : "0";
      });
      positionItems();
    }

    video.addEventListener("timeupdate", update);
    video.addEventListener("play", update);
    video.addEventListener("play", function () {
      requestAnimationFrame(update);
    });

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
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