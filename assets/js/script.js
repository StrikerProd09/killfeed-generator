var nr = 0;
var globalFlip = false;
var settings = {};

function bright() {
  document.getElementById("background_overlay").value = "#fff";
  document.getElementById("killfeed-generator").style.backgroundColor = "#fff";
}

function dark() {
  document.getElementById("background_overlay").value = "#222222";
  document.getElementById("killfeed-generator").style.backgroundColor =
    "#222222";
}

function background_apply() {
  var background = document.getElementById("background_overlay").value;
  document.getElementById("killfeed-generator").style.backgroundColor =
    background;
}

function players_apply() {
  var player_1 = document.getElementById("player_1").value;
  var player_2 = document.getElementById("player_2").value;
  console.log("Player 1: " + player_1 + " Player 2: " + player_2);
  var p1 = document.getElementsByClassName("player1");
  for (var i = 0; i < p1.length; i++) {
    p1[i].innerHTML = player_1;
  }
  var p2 = document.getElementsByClassName("player2");
  for (var i = 0; i < p2.length; i++) {
    p2[i].innerHTML = player_2;
  }
  updatePlayerParams(player_1, player_2);
}

function updatePlayerParams(player_1, player_2) {
  var hashAnchor = window.location.hash.split("?")[0] || "";
  var params = {};
  var sources = [window.location.search, window.location.hash];
  sources.forEach(function (source) {
    if (!source || source.indexOf("?") === -1) {
      return;
    }
    source
      .split("?")[1]
      .split("&")
      .forEach(function (pair) {
        var parts = pair.split("=");
        if (parts[0]) {
          params[decodeURIComponent(parts[0])] = decodeURIComponent(
            parts[1] || "",
          );
        }
      });
  });
  params["player_1"] = player_1;
  params["player_2"] = player_2;
  var pairs = [];
  Object.keys(params).forEach(function (key) {
    pairs.push(
      encodeURIComponent(key) + "=" + encodeURIComponent(params[key]),
    );
  });
  var newUrl =
    window.location.pathname + "?" + pairs.join("&") + hashAnchor;
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, "", newUrl);
  } else {
    window.location.hash = hashAnchor + "?" + pairs.join("&");
  }
}

function customize() {
  $("#options").toggle();
  $("#customize").toggleClass("btn-active");
}

function elValue(id, fallback) {
  var el = document.getElementById(id);
  return el ? el.value : fallback;
}

function hexToRgba(hex, opacity) {
  var clean = (hex || "#000000").replace("#", "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map(function (c) {
        return c + c;
      })
      .join("");
  }
  var num = parseInt(clean, 16);
  if (isNaN(num)) {
    num = 0;
  }
  var r = (num >> 16) & 255;
  var g = (num >> 8) & 255;
  var b = num & 255;
  return "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
}

function applyItemStyle() {
  var root = document.documentElement;
  var fontColor1 = elValue("item_font_color_1", elValue("item_font_color", "#ffffff"));
  var fontColor2 = elValue("item_font_color_2", elValue("item_font_color", "#ffffff"));
  var bgColor = elValue("item_bg_color", "#0c0c0c");
  var bgOpacity = parseFloat(elValue("item_bg_opacity", "100")) || 100;
  var borderWidth = elValue("item_border_width", "2");
  var borderRadius = elValue("item_border_radius", "0");
  root.style.setProperty(
    "--rkg-font-size-selected",
    document.getElementById("item_font_size").value + "px",
  );
  root.style.setProperty(
    "--rkg-font-family-selected",
    "'" + document.getElementById("item_font_family").value + "'",
  );
  root.style.setProperty(
    "--rkg-p-x-selected",
    document.getElementById("item_p_x").value + "px",
  );
  root.style.setProperty(
    "--rkg-p-y-selected",
    document.getElementById("item_p_y").value + "px",
  );
  root.style.setProperty("--rkg-font-color-selected", fontColor1);
  root.style.setProperty("--rkg-font-color-1-selected", fontColor1);
  root.style.setProperty("--rkg-font-color-2-selected", fontColor2);
  root.style.setProperty(
    "--rkg-background-color-selected",
    hexToRgba(bgColor, bgOpacity / 100),
  );
  var borderColor = elValue("item_border_color", "#1d1d1d");
  var borderOpacity = parseFloat(elValue("item_border_opacity", "100")) || 100;
  root.style.setProperty(
    "--rkg-border-width-selected",
    borderWidth + "px",
  );
  root.style.setProperty(
    "--rkg-border-color-selected",
    hexToRgba(borderColor, borderOpacity / 100),
  );
  root.style.setProperty(
    "--rkg-border-radius-selected",
    borderRadius + "px",
  );
  var itemsShadow = parseFloat(elValue("item_icon_shadow", "0")) || 0;
  var ratio = itemsShadow / 100;
  var iconMaxH = 50;
  var shadowOffset = (iconMaxH * 0.02 * ratio).toFixed(2);
  var shadowBlur = (iconMaxH * 0.1 * ratio).toFixed(2);
  root.style.setProperty("--rkg-items-shadow-x-selected", shadowOffset + "px");
  root.style.setProperty("--rkg-items-shadow-y-selected", shadowOffset + "px");
  root.style.setProperty("--rkg-items-shadow-blur-selected", shadowBlur + "px");
  root.style.setProperty(
    "--rkg-items-shadow-color-selected",
    "rgba(0, 0, 0, " + (0.8 * ratio).toFixed(2) + ")",
  );
}

function loadFontFromUrl(src, family) {
  var familyValue = family || "CustomFont";
  var srcValue = src || document.getElementById("item_font_src").value.trim();
  if (!srcValue) {
    console.warn("Provide a Font URL.");
    return;
  }
  var style = document.createElement("style");
  style.innerHTML =
    "@font-face { font-family: '" +
    familyValue +
    "'; src: url('" +
    srcValue +
    "'); }";
  document.head.appendChild(style);
  document.documentElement.style.setProperty(
    "--rkg-font-family-selected",
    "'" + familyValue + "'",
  );
  console.log("Loading font: " + familyValue + " from " + srcValue);
}

function loadExampleFont(src, family) {
  if (!src) {
    return;
  }
  var srcInput = document.getElementById("item_font_src");
  if (srcInput) {
    srcInput.value = src;
  }
  loadFontFromUrl(src, family);
}

function loadImage(src) {
  return new Promise(function (resolve, reject) {
    fetch(src)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load image: " + src);
        }
        return response.blob();
      })
      .then(function (blob) {
        var objectUrl = URL.createObjectURL(blob);
        var img = new Image();
        img.onload = function () {
          URL.revokeObjectURL(objectUrl);
          resolve(img);
        };
        img.onerror = function () {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load image: " + src));
        };
        img.src = objectUrl;
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

function drawKillfeedItem(item, scale) {
  return new Promise(function (resolve, reject) {
    var spec = window.getComputedStyle(item);
    var isFontFamilyKnown =
      spec.fontFamily && spec.fontFamily.indexOf("serif") === -1;

    var rootStyle = window.getComputedStyle(document.documentElement);
    var varFamily = (
      rootStyle.getPropertyValue("--rkg-font-family-selected") || ""
    )
      .replace(/["']/g, "")
      .trim();
    var varSize = rootStyle.getPropertyValue("--rkg-font-size-selected") || "";

    var fontFamily = isFontFamilyKnown
      ? spec.fontFamily.replace(/["']/g, "")
      : varFamily || "Roboto-Medium";
    var fontSize = isFontFamilyKnown
      ? parseFloat(spec.fontSize)
      : parseFloat(varSize);
    fontSize = fontSize && fontSize > 0 ? fontSize : 25;

    var fontColor =
      spec.color && spec.color !== "rgb(0, 0, 0)" ? spec.color : "#000";
    var bgColor = spec.backgroundColor || "#fff";
    var borderWidth = parseFloat(spec.borderLeftWidth) || 0;
    var borderColor = spec.borderColor || "#000";
    var padX = parseFloat(spec.paddingLeft) || 0;
    var padY = parseFloat(spec.paddingTop) || 0;

    var p1El = item.querySelector(".player1");
    var p2El = item.querySelector(".player2");
    var player1 = p1El ? p1El.textContent : "";
    var player2 = p2El ? p2El.textContent : "";
    var fontColor1 = p1El
      ? window.getComputedStyle(p1El).color
      : spec.color || "#000";
    var fontColor2 = p2El
      ? window.getComputedStyle(p2El).color
      : spec.color || "#000";
    var borderRadiusSpec =
      parseFloat(spec.borderTopLeftRadius) || 0;

    var weaponEl = item.querySelector("img.sp_icon");
    var isWeaponFlipped = weaponEl
      ? weaponEl.classList.contains("flip-horizontal")
      : false;
    var prefixEls = Array.prototype.slice.call(
      item.querySelectorAll(".additional[data-location='prefix']"),
    );
    var suffixEls = Array.prototype.slice.call(
      item.querySelectorAll(".additional[data-location='suffix']"),
    );
    var additionalEls = prefixEls.concat(suffixEls);
    var weaponSrc = weaponEl ? weaponEl.getAttribute("src") : null;

    var loaders = [];
    if (weaponSrc) loaders.push(loadImage(weaponSrc));
    additionalEls.forEach(function (slot) {
      var imgEl = slot.querySelector("img");
      var src = imgEl ? imgEl.getAttribute("src") : null;
      if (src) loaders.push(loadImage(src));
    });

    Promise.all(loaders)
      .then(function (imgs) {
        var weapon = imgs[0] || null;
        var prefixCount = prefixEls.length;
        var prefixImages = [];
        var suffixImages = [];
        for (var k = 1; k < imgs.length; k++) {
          if (k < 1 + prefixCount) {
            prefixImages.push(imgs[k]);
          } else {
            suffixImages.push(imgs[k]);
          }
        }

        var probe = document.createElement("canvas");
        var pctx = probe.getContext("2d");
        pctx.font = fontSize + "px " + fontFamily;
        var w1 = pctx.measureText(player1).width;
        var w2 = pctx.measureText(player2).width;

        var iconMaxH = Math.min(fontSize * 2, 50);
        var weaponW = weapon
          ? iconMaxH * (weapon.naturalWidth / weapon.naturalHeight)
          : 0;
        var prefixW = prefixImages.map(function (img) {
          return img ? iconMaxH * (img.naturalWidth / img.naturalHeight) : 0;
        });
        var suffixW = suffixImages.map(function (img) {
          return img ? iconMaxH * (img.naturalWidth / img.naturalHeight) : 0;
        });

        var gap = 10;
        var innerH = Math.max(fontSize, iconMaxH);
        var contentW = w1 + gap;
        prefixW.forEach(function (w) {
          contentW += w ? gap + w : 0;
        });
        contentW += weaponW ? gap + weaponW : 0;
        suffixW.forEach(function (w) {
          contentW += w ? gap + w : 0;
        });
        contentW += gap + w2;
        var totalW = contentW + padX * 2 + borderWidth * 2;
        var totalH = innerH + padY * 2 + borderWidth * 2;
        var centerY = totalH / 2;

        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(totalW * scale));
        canvas.height = Math.max(1, Math.round(totalH * scale));
        var ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);

        ctx.fillStyle = bgColor;
        if (borderRadiusSpec > 0) {
          ctx.beginPath();
          ctx.roundRect(0, 0, totalW, totalH, borderRadiusSpec);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, totalW, totalH);
        }

        if (borderWidth > 0) {
          ctx.lineWidth = borderWidth;
          ctx.strokeStyle = borderColor;
          if (borderRadiusSpec > 0) {
            ctx.beginPath();
            ctx.roundRect(
              borderWidth / 2,
              borderWidth / 2,
              totalW - borderWidth,
              totalH - borderWidth,
              borderRadiusSpec,
            );
            ctx.stroke();
          } else {
            ctx.strokeRect(
              borderWidth / 2,
              borderWidth / 2,
              totalW - borderWidth,
              totalH - borderWidth,
            );
          }
        }

        ctx.font = fontSize + "px " + fontFamily;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = fontColor1;

        var rootStyle = window.getComputedStyle(document.documentElement);
        var iconShadow = {
          x:
            parseFloat(
              rootStyle.getPropertyValue("--rkg-items-shadow-x-selected"),
            ) || 0,
          y:
            parseFloat(
              rootStyle.getPropertyValue("--rkg-items-shadow-y-selected"),
            ) || 0,
          blur:
            parseFloat(
              rootStyle.getPropertyValue("--rkg-items-shadow-blur-selected"),
            ) || 0,
          color:
            rootStyle.getPropertyValue("--rkg-items-shadow-color-selected") ||
            "rgba(0, 0, 0, 0)",
        };
        if (iconShadow.x || iconShadow.y || iconShadow.blur) {
          ctx.shadowColor = iconShadow.color;
          ctx.shadowOffsetX = iconShadow.x;
          ctx.shadowOffsetY = iconShadow.y;
          ctx.shadowBlur = iconShadow.blur;
        }

        var cursor = borderWidth + padX;
        ctx.fillText(player1, cursor, centerY);
        cursor += w1 + gap;

        for (var p = 0; p < prefixImages.length; p++) {
          var pImg = prefixImages[p];
          var pW = prefixW[p];
          if (!pImg || !pW) {
            continue;
          }
          ctx.drawImage(pImg, cursor, centerY - iconMaxH / 2, pW, iconMaxH);
          cursor += pW + gap;
        }

        if (weapon) {
          ctx.save();
          if (isWeaponFlipped) {
            ctx.translate(cursor + weaponW / 2, centerY);
            ctx.scale(-1, 1);
            ctx.drawImage(
              weapon,
              -weaponW / 2,
              -iconMaxH / 2,
              weaponW,
              iconMaxH,
            );
          } else {
            ctx.drawImage(
              weapon,
              cursor,
              centerY - iconMaxH / 2,
              weaponW,
              iconMaxH,
            );
          }
          ctx.restore();
          cursor += weaponW + gap;
        }

        for (var a = 0; a < suffixImages.length; a++) {
          var aImg = suffixImages[a];
          var aW = suffixW[a];
          if (!aImg || !aW) {
            continue;
          }
          ctx.drawImage(aImg, cursor, centerY - iconMaxH / 2, aW, iconMaxH);
          cursor += aW + gap;
        }

        ctx.fillStyle = fontColor2;
        ctx.fillText(player2, cursor, centerY);

        ctx.shadowColor = "transparent";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        resolve(canvas);
      })
      .catch(reject);
  });
}

function renderElementToCanvas(element) {
  return new Promise(function (resolve, reject) {
    var items;
    if (element.classList && element.classList.contains("killfeed-item")) {
      items = [element];
    } else {
      items = Array.prototype.slice.call(
        element.querySelectorAll(".killfeed-item"),
      );
    }
    var scale = 2;
    if (!items.length) {
      reject(new Error("No .killfeed-item found to render."));
      return;
    }
    Promise.all(
      items.map(function (item) {
        return drawKillfeedItem(item, scale);
      }),
    )
      .then(function (canvases) {
        resolve(canvases.length === 1 ? canvases[0] : canvases);
      })
      .catch(reject);
  });
}

function combineCanvases(canvases) {
  var gap = 16;
  var maxWidth = 0;
  var totalHeight = 0;
  canvases.forEach(function (canvas) {
    maxWidth = Math.max(maxWidth, canvas.width);
    totalHeight += canvas.height;
  });
  totalHeight += gap * (canvases.length - 1);

  var combined = document.createElement("canvas");
  combined.width = maxWidth;
  combined.height = totalHeight;
  var ctx = combined.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, combined.width, combined.height);

  var y = 0;
  canvases.forEach(function (canvas) {
    ctx.drawImage(canvas, (maxWidth - canvas.width) / 2, y);
    y += canvas.height + gap;
  });
  return combined;
}

function takeScreenShot() {
  document.getElementById("download_img").style.display = "flex";
  document.getElementById("convert_elem_msg").style.display = "flex";

  var preview = document.getElementById("target_preview");
  var source =
    preview &&
    (preview.classList.contains("killfeed-item") ||
      preview.querySelector(".killfeed-item"))
      ? preview
      : document.getElementById("killfeed-generator");

  var allContent = document.getElementById("download1").checked;

  return renderElementToCanvas(source).then(function (result) {
    var canvases = Array.isArray(result) ? result : [result];
    if (allContent && canvases.length > 1) {
      var combined = combineCanvases(canvases);
      combined.id = "IMG_" + nr + "_all";
      nr++;
      var downloadImg = document.getElementById("download_img");
      downloadImg.insertAdjacentElement("afterend", combined);
      combined.scrollIntoView();
      return [combined];
    }
    canvases.forEach(function (canvas, i) {
      canvas.id = "IMG_" + nr + "_" + i;
      nr++;
      var downloadImg = document.getElementById("download_img");
      downloadImg.insertAdjacentElement("afterend", canvas);
    });
    var last = canvases[canvases.length - 1];
    last.scrollIntoView();
    return canvases;
  });
}

$(document).ready(function () {
  var generatorElement = document.getElementById("killfeed-generator");
  var paramsFile = generatorElement
    ? generatorElement.getAttribute("params") || "killfeed-rust-params.json"
    : "killfeed-rust-params.json";

  function loadParams(fileName) {
    if (typeof images !== "undefined") {
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "assets/json/" + fileName, false);
    try {
      xhr.send(null);
      if (xhr.status === 200 || xhr.status === 0) {
        var params = JSON.parse(xhr.responseText);
        images = params.images || [];
        path = params.path || "assets/img/killfeed-icons/rust/";
        player1 = params.player1 || "Player1";
        player2 = params.player2 || "Player2";
        additionals = params.additionals || [];
        globalFlip = params.flip === true;
        settings = params.settings || {};
      } else {
        console.error(
          "Failed to load params: " + fileName + " (" + xhr.status + ")",
        );
      }
    } catch (e) {
      console.error("Failed to load params: " + fileName, e);
    }
  }

  loadParams(paramsFile);

  var optionsTpl;
  var optionsXhr = new XMLHttpRequest();
  optionsXhr.open("GET", "assets/tpl/options.tpl", false);
  try {
    optionsXhr.send(null);
    if (optionsXhr.status === 200 || optionsXhr.status === 0) {
      optionsTpl = optionsXhr.responseText;
    } else {
      console.error("Failed to load options.tpl (" + optionsXhr.status + ")");
    }
  } catch (e) {
    console.error("Failed to load options.tpl", e);
  }

  function slugify(name) {
    return String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .trim();
  }

  function additionalId(name) {
    return slugify(name) + "_toggle";
  }

  function buildAdditionalToggles() {
    var locMap = settings.additionals || {};
    var html = '<div class="option-group">';
    additionals.forEach(function (name, index) {
      var order = index + 1;
      var loc = (locMap[name] || "suffix").toLowerCase();
      html +=
        '<div class="option-field">' +
        "<span>" +
        name +
        ": </span>" +
        '<label class="toggle-switch">' +
        '<input type="checkbox" id="' +
        additionalId(name) +
        '" location="' +
        loc +
        '" order="' +
        order +
        '">' +
        '<span class="toggle-track"><span class="toggle-thumb"></span></span>' +
        "</label>" +
        "</div>";
    });
    html += "</div>";
    return html;
  }

  function buildField(field) {
    if (field.type === "font_family") {
      return (
        '<div class="option-field"><span>' +
        field.label +
        ": </span><select id='" +
        field.id +
        "'></select></div>"
      );
    }
    if (field.type === "color") {
      return (
        '<div class="option-field"><span>' +
        field.label +
        ": </span><input id='" +
        field.id +
        "' type='color' value='" +
        field.value +
        "'></div>"
      );
    }
    if (field.type === "range") {
      var fieldHtml =
        '<div class="option-field"><span>' +
        field.label +
        ": </span><input id='" +
        field.id +
        "' type='range' min='" +
        field.min +
        "' max='" +
        field.max +
        "' value='" +
        field.value +
        "' step='" +
        (field.step || 1) +
        "' style='width: 120px;'><span id='" +
        field.id +
        "_value'>" +
        field.value +
        "%</span></div>";
      return fieldHtml;
    }
    if (field.type === "number") {
      return (
        '<div class="option-field"><span>' +
        field.label +
        ": </span><input id='" +
        field.id +
        "' type='number' value='" +
        field.value +
        "' min='" +
        field.min +
        "' max='" +
        field.max +
        "'>" +
        (field.suffix ? "<span>" + field.suffix + "</span>" : "") +
        "</div>"
      );
    }
    if (field.type === "text") {
      return (
        '<div class="option-field"><span>' +
        field.label +
        ": </span><input id='" +
        field.id +
        "' type='text' value='" +
        (field.value || "") +
        "'" +
        (field.placeholder
          ? " placeholder='" + field.placeholder + "'"
          : "") +
        "></div>"
      );
    }
    return "";
  }

  function buildItemStyleGroups() {
    if (!settings.item_style || !settings.item_style.groups) {
      return "";
    }
    var fontSourceTpl = "";
    var fsMatch =
      optionsTpl !== undefined
        ? optionsTpl.match(
            /<script[^>]*id="rkg-tpl-font-source"[^>]*>([\s\S]*?)<\/script>/,
          )
        : null;
    if (fsMatch) {
      fontSourceTpl = fsMatch[1];
    }
    var html = "";
    settings.item_style.groups.forEach(function (group) {
      if (group.type === "font_source") {
        html += fontSourceTpl;
        return;
      }
      html += '<div class="option-group">';
      (group.fields || []).forEach(function (field) {
        html += buildField(field);
      });
      html += "</div>";
    });
    return html;
  }

  function optionsInner(tpl) {
    var m = tpl.match(/<div id="options">([\s\S]*?)<\/div>\s*<script/);
    return m ? m[1] : "";
  }

  function renderOptions() {
    var optionsEl = document.getElementById("options");
    if (!optionsEl || optionsTpl === undefined) {
      return;
    }
    var html = optionsInner(optionsTpl)
      .replace("{{additionals_toggles}}", buildAdditionalToggles())
      .replace("{{item_style_groups}}", buildItemStyleGroups());
    optionsEl.innerHTML = html;
  }

  renderOptions();

  function resolveFontSrc(src) {
    try {
      return new URL(src, window.location.href).href;
    } catch (e) {
      return src;
    }
  }

  function selectLocalFont() {
    var select = document.getElementById("item_font_family");
    var opt = select.options[select.selectedIndex];
    if (!opt) {
      return;
    }
    var src = resolveFontSrc(opt.getAttribute("data-src") || "");
    var srcInput = document.getElementById("item_font_src");
    if (srcInput) {
      srcInput.value = src;
    }
    loadFontFromUrl(src, opt.value);
  }

  function loadLocalFonts() {
    var select = document.getElementById("item_font_family");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "assets/json/fonts.json", false);
    try {
      xhr.send(null);
      if (xhr.status === 200 || xhr.status === 0) {
        var fonts = JSON.parse(xhr.responseText);
        select.innerHTML = "";
        fonts.forEach(function (font) {
          var opt = document.createElement("option");
          opt.value = font["font-family"];
          opt.setAttribute("data-src", font.src || "");
          opt.textContent = font["font-family"];
          select.appendChild(opt);
        });
        select.value = fonts[0]["font-family"] || "";
      } else {
        console.error("Failed to load fonts (" + xhr.status + ")");
      }
    } catch (e) {
      console.error("Failed to load fonts", e);
    }

    select.addEventListener("change", selectLocalFont);
    selectLocalFont();
  }

  loadLocalFonts();

  function additionalSlotsHtml(location) {
    var html = "";
    var toggles = document.querySelectorAll(
      ".toggle-switch input[type='checkbox'][location][order]",
    );
    for (var i = 0; i < toggles.length; i++) {
      var toggle = toggles[i];
      if (toggle.getAttribute("location") !== location) {
        continue;
      }
      var order = parseInt(toggle.getAttribute("order"), 10);
      var name = additionals[order - 1];
      html +=
        "<span class='additional' data-additional='" +
        name +
        "' data-location='" +
        location +
        "' data-order='" +
        order +
        "'></span>";
    }
    return html;
  }

  function renderKillfeedItems() {
    var items = document.querySelectorAll("killfeed-item");
    if (!items.length) {
      return;
    }
    items.forEach(function (el) {
      var img = el.getAttribute("img") || "";
      var p1 = el.getAttribute("player_name_1") || player1;
      var p2 = el.getAttribute("player_name_2") || player2;
      var id = el.getAttribute("id") || "";
      var location = el.getAttribute("location") || "suffix";

      var isFlipped = globalFlip || el.getAttribute("flip") === "true";
      var flipClass = isFlipped ? " flip-horizontal" : "";

      var item = document.createElement("div");
      item.className = "killfeed-item";
      if (id) {
        item.id = id;
      }
      item.innerHTML =
        "<p class='player1'>" +
        p1 +
        "</p>" +
        additionalSlotsHtml("prefix") +
        "<img class='sp_icon" +
        flipClass +
        "' alt='Weapon' src='" +
        path +
        img +
        ".webp'>" +
        additionalSlotsHtml("suffix") +
        "<p class='player2'>" +
        p2 +
        "</p>";
      el.appendChild(item);
    });
  }

  renderKillfeedItems();

  console.log("Length Array: " + images.length);

  var navShare = document.getElementById("nav-share");
  var navShareLabel = document.getElementById("nav-share-label");
  if (navShare && navShareLabel) {
    navShare.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(showCopied);
      } else {
        var input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        showCopied();
      }
    });
    navShareLabel.addEventListener("click", function (evt) {
      evt.stopPropagation();
    });
  }

  function showCopied() {
    navShareLabel.classList.add("show");
    clearTimeout(navShare._timer);
    navShare._timer = setTimeout(function () {
      navShareLabel.classList.remove("show");
    }, 1500);
  }

  function togglePreviewBox() {
    var box = document.getElementById("preview-box-output");
    var target = document.getElementById("target");
    if (!box || !target) {
      return;
    }
    var hasContent = target.querySelector(".killfeed-item") !== null;
    box.style.display = hasContent ? "flex" : "none";
  }
  togglePreviewBox();

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
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

  var text = "";
  for (var j = 0; j < images.length; j++) {
    var imgObj = images[j];
    var imgName = typeof imgObj === "object" ? imgObj.name : imgObj;

    var isFlipped =
      globalFlip || (typeof imgObj === "object" && imgObj.flip === true);
    var flipClass = isFlipped ? " flip-horizontal" : "";

    text +=
      "<div id=" +
      j +
      "_" +
      imgName +
      " class='killfeed-item'>" +
      "<p class='player1'>" +
      player1 +
      "</p>" +
      additionalSlotsHtml("prefix") +
      "<img class='sp_icon" +
      flipClass +
      "' alt='Weapon' src='" +
      path +
      imgName +
      ".webp'>" +
      additionalSlotsHtml("suffix") +
      "<p class='player2'>" +
      player2 +
      "</p></div>";
  }
  document.getElementById("killfeed-generator").innerHTML = text;

  function getUrlParam(name) {
    var sources = [window.location.search, window.location.hash];
    for (var s = 0; s < sources.length; s++) {
      var source = sources[s] || "";
      var query = source.indexOf("?") !== -1 ? source.split("?")[1] : "";
      var pairs = query.split("&");
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split("=");
        if (pair[0] && decodeURIComponent(pair[0]) === name) {
          return decodeURIComponent(pair[1] || "").replace(/^"+|"+$/g, "");
        }
      }
    }
    return null;
  }

  var urlP1 = getUrlParam("player_1");
  var urlP2 = getUrlParam("player_2");
  if (urlP1 !== null || urlP2 !== null) {
    var inputP1 = document.getElementById("player_1");
    var inputP2 = document.getElementById("player_2");
    if (inputP1 && urlP1 !== null) {
      inputP1.value = urlP1;
    }
    if (inputP2 && urlP2 !== null) {
      inputP2.value = urlP2;
    }
    players_apply();
    console.log("[url-params] player_1: " + urlP1 + " player_2: " + urlP2);
  }

  $(".toggle-switch input[type='checkbox'][location][order]").on(
    "change",
    function (evt) {
      var location = $(this).attr("location");
      var order = parseInt($(this).attr("order"), 10);
      var enabled = $(this).is(":checked");
      var name = additionals[order - 1];
      var selector =
        ".additional[data-location='" +
        location +
        "'][data-order='" +
        order +
        "']";
      var slots = document.querySelectorAll(selector);
      for (var i = 0; i < slots.length; i++) {
        slots[i].innerHTML = enabled
          ? "<img class='sp_icon' alt='" +
            name +
            "' src='" +
            path +
            name +
            ".webp'>"
          : "";
      }
    },
  );

  $("#download_img").hide();
  $("#convert_elem").hide();
  $("#convert_elem_msg").hide();

  $(".killfeed-item").click(function (evt) {
    $("#convert_elem").show();
    var id = $(this).attr("id");
    console.log("Element selected - ID: " + id);
    var preview = document.getElementById(id);
    console.log("killfeed-generator " + id + ": " + preview);
    window.__selectedKillfeedHTML = preview.innerHTML;
    document.getElementById("target").innerHTML =
      "<div id='target_preview' id_target=" +
      id +
      " class='killfeed-item'>" +
      preview.innerHTML +
      "</div>";
    togglePreviewBox();
  });

  $("#download1").on("change", function (evt) {
    $("#convert_elem").show();
    var id = $(this).attr("id");
    console.log("All killfeed-generator selected - ID: " + id);
    if ($(this).is(":checked")) {
      var preview = document.getElementById("killfeed-generator");
      console.log("killfeed-generator " + id + ": " + preview);
      document.getElementById("target").innerHTML =
        "<div id='target_preview' id_target=" +
        id +
        ">" +
        preview.innerHTML +
        "</div>";
      togglePreviewBox();
    }
  });

  document
    .getElementById("download_link")
    .addEventListener("click", function (evt) {
      var canvases = Array.prototype.slice.call(
        document.querySelectorAll("#killfeed-generator-output canvas"),
      );
      if (canvases.length) {
        if (document.getElementById("download1").checked) {
          canvases.forEach(downloadCanvas);
        } else {
          downloadCanvas(canvases[canvases.length - 1]);
        }
      } else {
        takeScreenShot().then(function (result) {
          var list = Array.isArray(result) ? result : [result];
          var latest = list[list.length - 1];
          if (latest) {
            downloadCanvas(latest);
          }
        });
      }
    });

  function downloadCanvas(canvas) {
    canvas.toBlob(function (blob) {
      if (blob) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.download = (canvas.id || "killfeed") + ".webp";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        console.error("Could not generate image blob.");
      }
    }, "image/webp");
  }

  var itemStyleSection = document.querySelector(".item-style-tab");
  if (itemStyleSection) {
    ["input", "change"].forEach(function (eventName) {
      itemStyleSection.addEventListener(eventName, function (evt) {
        var target = evt.target;
        if (
          target &&
          target.id &&
          target.id.indexOf("item_") === 0 &&
          target.id !== "item_font_src"
        ) {
          if (
            target.id === "item_bg_opacity" ||
            target.id === "item_icon_shadow" ||
            target.id === "item_border_opacity"
          ) {
            var valueId =
              target.id === "item_bg_opacity"
                ? "item_bg_opacity_value"
                : target.id === "item_icon_shadow"
                  ? "item_icon_shadow_value"
                  : "item_border_opacity_value";
            var label = document.getElementById(valueId);
            if (label) {
              label.textContent = target.value + "%";
            }
          }
          applyItemStyle();
        }
      });
    });
  }

  var urlItem = getUrlParam("killfeed-item");
  if (urlItem !== null) {
    var gridItems = document.querySelectorAll(
      "#killfeed-generator .killfeed-item",
    );
    for (var gi = 0; gi < gridItems.length; gi++) {
      var simg = gridItems[gi].querySelector("img.sp_icon");
      var ssrc = simg ? simg.getAttribute("src") : "";
      var sname = ssrc.replace(/^.*\//, "").replace(/\.(webp|png|jpg)$/, "");
      if (sname === urlItem) {
        gridItems[gi].click();
        console.log("[url-params] killfeed-item selected: " + sname);
        break;
      }
    }
  }

  var urlStyleIds = [
    "item_font_size",
    "item_font_family",
    "item_p_x",
    "item_p_y",
    "item_font_color_1",
    "item_font_color_2",
    "item_bg_color",
    "item_bg_opacity",
    "item_border_width",
    "item_border_radius",
    "item_border_color",
    "item_border_opacity",
    "item_icon_shadow",
    "item_font_src",
  ];
  var styleApplied = false;
  urlStyleIds.forEach(function (id) {
    var val = getUrlParam(id);
    if (val === null) {
      return;
    }
    var el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.value = val;
    var label = document.getElementById(id + "_value");
    if (label) {
      label.textContent = val + "%";
    }
    styleApplied = true;
  });
  if (styleApplied) {
    applyItemStyle();
    console.log("[url-params] item style overrides applied");
  }

  if (getUrlParam("convert") === "true" || getUrlParam("export") === "true") {
    var fontsReady =
      document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();
    fontsReady
      .then(function () {
        return takeScreenShot();
      })
      .then(function (result) {
        console.log("[url-params] conversion done");
        if (getUrlParam("export") === "true") {
          var canvases = Array.isArray(result) ? result : [result];
          if (canvases.length) {
            downloadCanvas(canvases[canvases.length - 1]);
          }
        }
      });
  }
});
