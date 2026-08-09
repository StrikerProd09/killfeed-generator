(function () {
  var MAX_ITEMS = 6;

  function init() {
    var section = document.getElementById("preview-killfeed-screenshot");
    if (!section) {
      return;
    }

    var fileInput = document.getElementById("screenshot_file");
    var image = document.getElementById("screenshot-image");
    var stage = document.getElementById("screenshot-stage");
    var killfeeds = document.getElementById("screenshot-killfeeds");
    var addBtn = document.getElementById("screenshot_add_elem");
    var downloadBtn = document.getElementById("screenshot_download");
    var zoomInput = document.getElementById("screenshot_zoom");

    if (!image || !stage || !killfeeds || !addBtn || !downloadBtn) {
      return;
    }

    var defaultImg =
      section.getAttribute("data-preview-img") || "assets/img/gameplay/cs2.webp";
    image.src = defaultImg;

    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) {
        return;
      }
      if (file.type.indexOf("image/") !== 0) {
        console.error("Selected file is not an image");
        return;
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        image.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    function applyGap() {
      var height = image.offsetHeight || image.naturalHeight || 0;
      killfeeds.style.setProperty("--screenshot-img-height", height + "px");
    }

    image.addEventListener("load", applyGap);
    window.addEventListener("resize", applyGap);
    applyGap();

    var count = 0;

    function zoomValue() {
      return zoomInput ? parseFloat(zoomInput.value) || 100 : 100;
    }

    function applyZoom() {
      stage.style.zoom = zoomValue() / 100;
    }

    if (zoomInput) {
      zoomInput.value = 100;
      zoomInput.addEventListener("input", applyZoom);
      applyZoom();
    }

    function addItem() {
      if (killfeeds.querySelectorAll(".killfeed-item").length >= MAX_ITEMS) {
        console.warn("Max " + MAX_ITEMS + " killfeeds reached");
        return;
      }
      var html = window.__selectedKillfeedHTML || defaultItemHtml();
      var item = document.createElement("div");
      item.className = "killfeed-item";
      item.innerHTML = html;
      inlineItemStyles(item);
      killfeeds.appendChild(item);
      applyGap();
    }

    function inlineItemStyles(item) {
      var fontFamily = "";
      var fontSize = "";
      var color = "";
      var backgroundColor = "";
      var borderWidth = "";
      var borderColor = "";
      var padX = "";
      var padY = "";
      try {
        var root = window.getComputedStyle(document.documentElement);
        fontFamily = root.getPropertyValue("--rkg-font-family-selected") || "";
        fontSize = root.getPropertyValue("--rkg-font-size-selected") || "";
        color = root.getPropertyValue("--rkg-font-color-selected") || "";
        backgroundColor =
          root.getPropertyValue("--rkg-background-color-selected") || "";
        borderWidth =
          root.getPropertyValue("--rkg-border-width-selected") || "";
        borderColor =
          root.getPropertyValue("--rkg-border-color-selected") || "";
        padX = root.getPropertyValue("--rkg-p-x-selected") || "";
        padY = root.getPropertyValue("--rkg-p-y-selected") || "";
      } catch (e) {
        fontFamily = "";
      }
      if (fontSize) {
        item.style.fontSize = fontSize.trim() + "px";
        var players = item.querySelectorAll("p");
        for (var i = 0; i < players.length; i++) {
          players[i].style.fontSize = fontSize.trim() + "px";
        }
      }
      if (fontFamily) {
        item.style.fontFamily = fontFamily.trim();
        var p2 = item.querySelectorAll("p");
        for (var j = 0; j < p2.length; j++) {
          p2[j].style.fontFamily = fontFamily.trim();
        }
      }
      if (color) {
        item.style.color = color.trim();
      }
      if (backgroundColor) {
        item.style.backgroundColor = backgroundColor.trim();
      }
      if (borderWidth && borderColor) {
        item.style.border =
          borderWidth.trim() + "px solid " + borderColor.trim();
      }
      if (padX) {
        item.style.paddingLeft = padX.trim() + "px";
        item.style.paddingRight = padX.trim() + "px";
      }
      if (padY) {
        item.style.paddingTop = padY.trim() + "px";
        item.style.paddingBottom = padY.trim() + "px";
      }
    }

    function defaultItemHtml() {
      var imgName =
        (typeof window.images !== "undefined" && window.images.length
          ? window.images[0]
          : "ak47") + "";
      if (typeof imgName === "object") {
        imgName = imgName.name || "ak47";
      }
      var flipClass =
        window.globalFlip === true ? " flip-horizontal" : "";
      return (
        "<p class='player1'>" +
        (window.player1 || "Player1") +
        "</p><img class='sp_icon" +
        flipClass +
        "' alt='Weapon' src='" +
        window.path +
        imgName +
        ".webp'>" +
        "<p class='player2'>" +
        (window.player2 || "Player2") +
        "</p>"
      );
    }

    function loadBackgroundImage() {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          resolve(img);
        };
        img.onerror = function () {
          reject(new Error("Could not load background image"));
        };
        img.src = image.src;
      });
    }

    function composeScreenshot() {
      var zoom = zoomValue() / 100;
      var items = killfeeds.querySelectorAll(".killfeed-item");
      var jobs = Array.prototype.map.call(items, function (item) {
        return window.drawKillfeedItem(item, 1);
      });
      var fontReady =
        document.fonts && document.fonts.ready
          ? document.fonts.ready
          : Promise.resolve();

      return Promise.all([fontReady, loadBackgroundImage()])
        .then(function (data) {
          var bg = data[1];
          var bgW = bg.naturalWidth || bg.width;
          var bgH = bg.naturalHeight || bg.height;
          var margin = Math.round(bgH * 0.02);
          var gap = Math.round(bgH * 0.02);
          var canvas = document.createElement("canvas");
          canvas.width = Math.round(bgW * zoom);
          canvas.height = Math.round(bgH * zoom);
          var ctx = canvas.getContext("2d");
          ctx.scale(zoom, zoom);
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, bgW, bgH);
          ctx.drawImage(bg, 0, 0, bgW, bgH);
          return Promise.all(jobs).then(function (itemCanvases) {
            var y = margin;
            itemCanvases.forEach(function (itemCanvas) {
              var x = bgW - itemCanvas.width - margin;
              ctx.drawImage(itemCanvas, x, y);
              y += itemCanvas.height + gap;
            });
            return canvas;
          });
        });
    }

    function downloadScreenshot() {
      composeScreenshot()
        .then(function (canvas) {
          canvas.id = "screenshot_canvas_" + count;
          count++;
          return new Promise(function (resolve) {
            canvas.toBlob(
              function (blob) {
                resolve(blob);
              },
              "image/webp",
            );
          });
        })
        .then(function (blob) {
          if (blob) {
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.download = "screenshot.webp";
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          } else {
            console.error("Could not generate screenshot blob.");
          }
        })
        .catch(function (e) {
          console.error("Could not generate screenshot", e);
        });
    }

    addBtn.addEventListener("click", addItem);
    downloadBtn.addEventListener("click", downloadScreenshot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();