(function () {
  var PAGES_URL = "assets/json/pages.json";

  function findContainer() {
    var el = document.getElementById("pages");
    if (el) {
      return el;
    }
    var containers = document.querySelectorAll("[id]");
    for (var i = 0; i < containers.length; i++) {
      if (containers[i].id === "#pages") {
        return containers[i];
      }
    }
    return null;
  }

  function parseJson(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("[pages-listing] invalid JSON", e);
      return null;
    }
  }

  function renderPages(pages, container) {
    if (!pages || !pages.length) {
      console.log("[pages-listing] no pages found");
      return;
    }
    var listing = document.createElement("ul");
    listing.className = "card-listing";
    pages.forEach(function (page) {
      listing.appendChild(buildCard(page));
    });
    container.appendChild(listing);
    console.log(
      "[pages-listing] rendered " + listing.children.length + " cards",
    );
  }

  function loadViaXhr(container) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", PAGES_URL, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status !== 200) {
        console.error(
          "[pages-listing] XHR failed (status " +
            xhr.status +
            ") for " +
            PAGES_URL,
        );
        return;
      }
      var pages = parseJson(xhr.responseText);
      if (pages) {
        renderPages(pages, container);
      }
    };
    xhr.onerror = function () {
      console.error("[pages-listing] XHR network error for " + PAGES_URL);
    };
    try {
      xhr.send(null);
    } catch (e) {
      console.error("[pages-listing] XHR send error", e);
    }
  }

  function loadViaFetch(container) {
    fetch(PAGES_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.text();
      })
      .then(function (text) {
        var pages = parseJson(text);
        if (pages) {
          renderPages(pages, container);
        }
      })
      .catch(function (err) {
        console.error("[pages-listing] fetch failed", err);
      });
  }

  function usePageHtml() {
    var url = window.location;
    return (
      url.protocol === "file:" ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1"
    );
  }

  function buildCard(page) {
    var item = document.createElement("li");
    item.className = "card-page";

    var link = document.createElement("a");
    link.className = "card-page-link";
    link.href = usePageHtml(page)
      ? page.page_html || "#"
      : page.path_url || "#";

    var background = document.createElement("div");
    background.className = "card-page-background";
    background.setAttribute("role", "img");
    background.setAttribute("aria-label", page.title || "");
    if (page.img_bg) {
      background.style.backgroundImage = "url('" + page.img_bg + "')";
    }
    link.appendChild(background);

    var inner = document.createElement("div");
    inner.className = "card-page-inner";

    var title = document.createElement("h2");
    title.className = "card-page-title";
    title.textContent = page.title || "";
    inner.appendChild(title);

    var description = document.createElement("p");
    description.className = "card-page-description";
    description.textContent = page.description || "";
    inner.appendChild(description);

    var cta = document.createElement("span");
    cta.className = "card-page-cta";
    cta.innerHTML =
      "Open generator" +
      '<span class="card-page-cta-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
      'stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path>' +
      '<path d="M13 6l6 6-6 6"></path></svg></span>';
    inner.appendChild(cta);

    link.appendChild(inner);

    var arrow = document.createElement("span");
    arrow.className = "card-page-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
      'stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"></path>' +
      '<path d="M8 7h9v9"></path></svg>';
    link.appendChild(arrow);

    item.appendChild(link);
    return item;
  }

  function init() {
    var container = findContainer();
    if (!container) {
      console.error("[pages-listing] target #pages container not found");
      return;
    }

    if (window.fetch && window.location.protocol !== "file:") {
      loadViaFetch(container);
    } else {
      console.error(
        "[pages-listing] cannot load JSON over " +
          window.location.protocol +
          " - open the site over http (localhost)",
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
