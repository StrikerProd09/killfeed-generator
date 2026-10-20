(function () {
  "use strict";

  var activeDrawer = null;
  var drawers = [];

  function syncScrollLock() {
    var open = false;
    for (var i = 0; i < drawers.length; i++) {
      if (drawers[i] && drawers[i].isOpen()) {
        open = true;
        break;
      }
    }
    document.body.classList.toggle("kg-drawer-open", open);
  }

  function setupDrawer(config) {
    var drawer = document.getElementById(config.id);
    var overlay = document.getElementById(config.overlayId);
    if (!drawer || !overlay) {
      return null;
    }

    var triggers = Array.prototype.slice.call(
      document.querySelectorAll(config.toggleSelector),
    );
    var closeButtons = Array.prototype.slice.call(
      document.querySelectorAll(config.closeSelector),
    );
    var lastTrigger = null;
    var api = { isOpen: isOpen, setOpen: setOpen };

    function isOpen() {
      return drawer.classList.contains("is-open");
    }

    function setOpen(open, trigger) {
      if (open === isOpen()) {
        return;
      }

      if (open && activeDrawer && activeDrawer !== api) {
        activeDrawer.setOpen(false);
      }

      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      overlay.hidden = !open;

      triggers.forEach(function (item) {
        item.setAttribute("aria-expanded", open ? "true" : "false");
      });

      if (open) {
        if (typeof config.onOpen === "function") {
          config.onOpen();
        }
        activeDrawer = api;
        lastTrigger = trigger || document.activeElement;
        var first = drawer.querySelector(config.closeSelector);
        if (first) {
          first.focus({ preventScroll: true });
        }
      } else {
        if (typeof config.onClose === "function") {
          config.onClose();
        }
        if (lastTrigger && typeof lastTrigger.focus === "function") {
          lastTrigger.focus();
        }
        lastTrigger = null;
        if (activeDrawer === api) {
          activeDrawer = null;
        }
      }

      syncScrollLock();
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        if (typeof config.onTrigger === "function") {
          config.onTrigger(trigger);
        }
        setOpen(!isOpen(), trigger);
      });
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setOpen(false);
      });
    });

    overlay.addEventListener("click", function () {
      setOpen(false);
    });

    drawer.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") {
        return;
      }
      var focusable = drawer.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) {
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    return api;
  }

  var studioModal = document.getElementById("kg-settings-drawer");
  var modalTabs = Array.prototype.slice.call(
    document.querySelectorAll("[data-kg-modal-tab]"),
  );
  var movedPreviewContent = null;
  var movedPreviewParent = null;
  var movedPreviewNext = null;
  var movedWeaponGrid = null;
  var movedWeaponParent = null;
  var movedWeaponNext = null;

  function activateStudioPane(name) {
    if (!studioModal) {
      return;
    }
    studioModal.setAttribute("data-active-pane", name);
    modalTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-kg-modal-tab") === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });
  }

  modalTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateStudioPane(tab.getAttribute("data-kg-modal-tab"));
    });
    tab.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      event.preventDefault();
      var index = modalTabs.indexOf(tab);
      var next =
        event.key === "ArrowRight"
          ? (index + 1) % modalTabs.length
          : (index - 1 + modalTabs.length) % modalTabs.length;
      activateStudioPane(modalTabs[next].getAttribute("data-kg-modal-tab"));
      modalTabs[next].focus();
    });
  });

  function moveStudioContentIntoModal() {
    var preview = document.getElementById("preview_content");
    var previewSlot = document.getElementById("kg-modal-preview-slot");
    if (preview && previewSlot && preview.parentNode !== previewSlot) {
      movedPreviewContent = preview;
      movedPreviewParent = preview.parentNode;
      movedPreviewNext = preview.nextSibling;
      previewSlot.appendChild(preview);
    }

    var grid = document.getElementById("killfeed-generator");
    var pickerSlot = document.getElementById("kg-modal-picker-slot");
    if (grid && pickerSlot && grid.parentNode !== pickerSlot) {
      movedWeaponGrid = grid;
      movedWeaponParent = grid.parentNode;
      movedWeaponNext = grid.nextSibling;
      pickerSlot.appendChild(grid);
    }
  }

  function restoreStudioContentFromModal() {
    if (movedPreviewContent && movedPreviewParent) {
      movedPreviewParent.insertBefore(movedPreviewContent, movedPreviewNext);
    }
    if (movedWeaponGrid && movedWeaponParent) {
      movedWeaponParent.insertBefore(movedWeaponGrid, movedWeaponNext);
    }
    movedPreviewContent = null;
    movedPreviewParent = null;
    movedPreviewNext = null;
    movedWeaponGrid = null;
    movedWeaponParent = null;
    movedWeaponNext = null;

    scheduleExportRefresh();
  }

  var settingsDrawer = setupDrawer({
    id: "kg-settings-drawer",
    overlayId: "kg-settings-overlay",
    toggleSelector: "[data-kg-settings-toggle], [data-kg-picker-expand]",
    closeSelector: "[data-kg-settings-close]",
    onTrigger: function (trigger) {
      activateStudioPane(
        trigger.hasAttribute("data-kg-picker-expand") ? "weapons" : "settings",
      );
    },
    onOpen: moveStudioContentIntoModal,
    onClose: restoreStudioContentFromModal,
  });

  activateStudioPane("settings");

  var guideDrawer = setupDrawer({
    id: "kg-guide-drawer",
    overlayId: "kg-guide-overlay",
    toggleSelector: "[data-kg-guide-toggle]",
    closeSelector: "[data-kg-guide-close]",
  });

  drawers = [settingsDrawer, guideDrawer];

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && activeDrawer) {
      activeDrawer.setOpen(false);
    }
  });

  var previewPanel = document.getElementById("previews");
  var previewBackdrop = document.getElementById("kg-preview-backdrop");
  var previewExpand = document.getElementById("kg-preview-expand");
  var previewClose = document.getElementById("kg-preview-close");
  var previewLastFocus = null;

  function setPreviewExpanded(open, trigger) {
    if (!previewPanel || !previewBackdrop) {
      return;
    }

    previewPanel.classList.toggle("is-expanded", open);
    previewBackdrop.hidden = !open;
    document.body.classList.toggle("kg-preview-open", open);

    if (open) {
      previewPanel.setAttribute("role", "dialog");
      previewPanel.setAttribute("aria-modal", "true");
      previewPanel.setAttribute("aria-labelledby", "kg-preview-title");
    } else {
      previewPanel.removeAttribute("role");
      previewPanel.removeAttribute("aria-modal");
      previewPanel.removeAttribute("aria-labelledby");
    }

    if (previewExpand) {
      previewExpand.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (previewClose) {
      previewClose.hidden = !open;
    }

    if (open) {
      if (activeDrawer) {
        activeDrawer.setOpen(false);
      }
      previewLastFocus = trigger || document.activeElement;
      if (previewClose) {
        previewClose.focus({ preventScroll: true });
      }
    } else {
      if (previewLastFocus && typeof previewLastFocus.focus === "function") {
        previewLastFocus.focus();
      }
      previewLastFocus = null;
    }
  }

  if (previewExpand) {
    previewExpand.addEventListener("click", function () {
      setPreviewExpanded(true, previewExpand);
    });
  }

  if (previewClose) {
    previewClose.addEventListener("click", function () {
      setPreviewExpanded(false);
    });
  }

  if (previewBackdrop) {
    previewBackdrop.addEventListener("click", function () {
      setPreviewExpanded(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (!previewPanel || !previewPanel.classList.contains("is-expanded")) {
      return;
    }

    if (event.key === "Escape") {
      setPreviewExpanded(false);
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    var focusable = Array.prototype.filter.call(
      previewPanel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
      function (element) {
        return element.getClientRects().length > 0;
      },
    );
    if (!focusable.length) {
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  var previewFab = document.querySelector("[data-kg-preview-expand]");
  if (previewFab) {
    previewFab.addEventListener("click", function () {
      setPreviewExpanded(true, previewFab);
    });
  }

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") {
        return;
      }
      if (
        !target.closest(
          "[data-kg-settings-toggle], [data-kg-picker-expand], [data-kg-guide-toggle]",
        )
      ) {
        return;
      }
      if (previewPanel && previewPanel.classList.contains("is-expanded")) {
        setPreviewExpanded(false);
      }
    },
    true,
  );

  var tabButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-kg-tab]"),
  );
  var tabPanels = Array.prototype.slice.call(
    document.querySelectorAll("[data-kg-panel]"),
  );

  function activateTab(name) {
    tabButtons.forEach(function (button) {
      var active = button.getAttribute("data-kg-tab") === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
    });
    tabPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-kg-panel") !== name;
    });
  }

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activateTab(button.getAttribute("data-kg-tab"));
    });
  });

  Array.prototype.slice
    .call(document.querySelectorAll("[data-kg-open-tab]"))
    .forEach(function (link) {
      link.addEventListener("click", function () {
        activateTab(link.getAttribute("data-kg-open-tab"));
      });
    });

  var tablist = document.querySelector(".kg-tablist");
  if (tablist) {
    tablist.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      var current = document.activeElement;
      if (!current || !current.hasAttribute("data-kg-tab")) {
        return;
      }
      event.preventDefault();
      var index = tabButtons.indexOf(current);
      if (index === -1) {
        return;
      }
      var next =
        event.key === "ArrowRight"
          ? (index + 1) % tabButtons.length
          : (index - 1 + tabButtons.length) % tabButtons.length;
      tabButtons[next].focus();
      activateTab(tabButtons[next].getAttribute("data-kg-tab"));
    });
  }

  var userConverted = false;
  var convertButton = document.getElementById("convert_elem");
  if (convertButton) {
    convertButton.addEventListener("click", function () {
      userConverted = true;
      var autoCanvas = document.querySelector(
        '#killfeed-generator-output canvas[data-kg-auto="true"]',
      );
      if (autoCanvas) {
        autoCanvas.remove();
      }
    });
  }

  function exportCanvasSlot() {
    return document.getElementById("kg-export-canvas-slot");
  }

  function placeExportCanvas(canvas, index) {
    var slot = exportCanvasSlot();
    if (!slot) {
      return;
    }
    window.nr = window.nr || 1;
    canvas.id = "IMG_" + window.nr + "_" + index;
    window.nr += 1;
    canvas.dataset.rkgAuto = "true";
    slot.appendChild(canvas);
  }

  function renderInitialCanvas() {
    if (
      userConverted ||
      document.querySelector("#killfeed-generator-output canvas") ||
      document.querySelector("#kg-export-canvas-slot canvas") ||
      document.querySelector("#export canvas")
    ) {
      return;
    }

    var preview = document.getElementById("target_preview");
    if (!preview || typeof window.renderElementToCanvas !== "function") {
      return;
    }

    window
      .renderElementToCanvas(preview)
      .then(function (result) {
        var canvases = Array.isArray(result) ? result : [result];
        var downloadImg = document.getElementById("download_img");
        if (!downloadImg) {
          return;
        }

        downloadImg.style.display = "flex";
        var message = document.getElementById("convert_elem_msg");
        if (message) {
          message.style.display = "flex";
        }

        canvases.forEach(function (canvas, index) {
          placeExportCanvas(canvas, index);
        });
      })
      .catch(function () {});
  }

  var weaponRoot = document.getElementById("killfeed-generator");

  function weaponName(item) {
    var img = null;
    for (var wi = 0; wi < item.children.length; wi++) {
      var child = item.children[wi];
      if (child.tagName === "IMG" && child.classList.contains("sp_icon")) {
        img = child;
        break;
      }
    }
    if (!img) {
      img = item.querySelector("img.sp_icon") || item.querySelector("img");
    }
    var name = "";

    if (img) {
      var src = img.getAttribute("src") || "";
      var file = src.split("/").pop().split("?")[0].split("#")[0];
      file = file.replace(/\.[^.]+$/, "");
      try {
        file = decodeURIComponent(file);
      } catch (error) {
      }
      if (file && file.toLowerCase() !== "weapon") {
        name = file;
      }
    }

    if (!name) {
      name = (item.id || "").replace(/^\d+_/, "").replace(/_/g, " ");
    }

    return name || "killfeed";
  }

  function enhanceWeaponItems() {
    if (!weaponRoot) {
      return;
    }

    Array.prototype.forEach.call(
      weaponRoot.querySelectorAll(".killfeed-item"),
      function (item) {
        if (item.dataset.rkgKeyboard === "true") {
          return;
        }

        item.dataset.rkgKeyboard = "true";
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute(
          "aria-label",
          "Select " + weaponName(item) + " killfeed",
        );

        item.addEventListener("keydown", function (event) {
          if (
            event.key === "Enter" ||
            event.key === " " ||
            event.key === "Spacebar"
          ) {
            event.preventDefault();
            item.click();
          }
        });
      },
    );

    var count = weaponRoot.querySelectorAll(".killfeed-item").length;
    if (count) {
      Array.prototype.forEach.call(
        document.querySelectorAll("[data-kg-weapon-count]"),
        function (el) {
          el.textContent = count;
        },
      );
    }
  }

  enhanceWeaponItems();
  if (weaponRoot && window.MutationObserver) {
    new MutationObserver(enhanceWeaponItems).observe(weaponRoot, {
      childList: true,
      subtree: true,
    });
  }

  var exportRefreshTimer = null;

  function clearExportCanvases() {
    var slot = exportCanvasSlot();
    if (slot) {
      Array.prototype.forEach.call(
        slot.querySelectorAll("canvas"),
        function (canvas) {
          canvas.remove();
        },
      );
    }

    var download = document.getElementById("download_img");
    if (!download) {
      return;
    }
    var node = download.nextElementSibling;
    while (node && node.tagName === "CANVAS") {
      var next = node.nextElementSibling;
      node.remove();
      node = next;
    }
  }

  function refreshExportCanvas() {
    var allContent = document.getElementById("download1");
    if (allContent && allContent.checked) {
      return;
    }

    var preview = document.getElementById("target_preview");
    var download = document.getElementById("download_img");
    if (
      !preview ||
      !download ||
      typeof window.renderElementToCanvas !== "function"
    ) {
      return;
    }

    clearExportCanvases();
    window
      .renderElementToCanvas(preview)
      .then(function (result) {
        var canvases = Array.isArray(result) ? result : [result];
        download.style.display = "flex";
        var message = document.getElementById("convert_elem_msg");
        if (message) {
          message.style.display = "flex";
        }
        canvases.forEach(function (canvas, index) {
          placeExportCanvas(canvas, index);
        });
      })
      .catch(function () {});
  }

  function scheduleExportRefresh() {
    window.clearTimeout(exportRefreshTimer);
    exportRefreshTimer = window.setTimeout(refreshExportCanvas, 240);
  }

  var targetRoot = document.getElementById("target");
  if (targetRoot && window.MutationObserver) {
    new MutationObserver(scheduleExportRefresh).observe(targetRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "src"],
      characterData: true,
    });
  }

  window.rkgRefreshExport = refreshExportCanvas;
  window.rkgClearExport = clearExportCanvases;

  var exportActions = document.querySelector(".kg-export-actions");
  if (exportActions && window.MutationObserver) {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes, function (node) {
          if (node.nodeType === 1 && node.tagName === "CANVAS") {
            var slot = exportCanvasSlot();
            if (slot) {
              slot.appendChild(node);
            }
          }
        });
      });
    }).observe(exportActions, { childList: true });
  }

  if (weaponRoot) {
    weaponRoot.addEventListener("click", function (event) {
      if (event.target.closest(".killfeed-item")) {
        scheduleExportRefresh();
      }
    });
  }

  var optionsRoot = document.getElementById("options");
  if (optionsRoot) {
    optionsRoot.addEventListener("input", scheduleExportRefresh);
    optionsRoot.addEventListener("change", scheduleExportRefresh);
    optionsRoot.addEventListener("click", function (event) {
      if (event.target.closest("button")) {
        scheduleExportRefresh();
      }
    });
  }

  document.addEventListener(
    "click",
    function (event) {
      if (event.target.closest("#convert_elem")) {
        clearExportCanvases();
      }
    },
    true,
  );

  function selectInitialKillfeed() {
    var first = document.querySelector("#killfeed-generator .killfeed-item");
    if (!first) {
      window.setTimeout(selectInitialKillfeed, 120);
      return;
    }

    if (document.querySelector("#target .killfeed-item")) {
      return;
    }

    first.click();
    window.setTimeout(function () {
      if (!document.querySelector("#target .killfeed-item")) {
        first.click();
      }
      window.setTimeout(renderInitialCanvas, 500);
    }, 120);
  }

  function scheduleInitialKillfeed() {
    window.setTimeout(selectInitialKillfeed, 150);
  }

  if (window.jQuery) {
    window.jQuery(scheduleInitialKillfeed);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleInitialKillfeed);
  } else {
    scheduleInitialKillfeed();
  }
})();
