<div id="options">
  <div class="option-group">
    <div class="option-field">
      <div class="option-field-row">
        <input type="text" id="player_1" value="" placeholder="Player" aria-label="Player 1">
      </div>
    </div>
    <div class="option-field">
      <div class="option-field-row">
        <input type="text" id="player_2" value="" placeholder="Enemy" aria-label="Player 2">
      </div>
    </div>
  </div>
  {{additionals_toggles}}
  <section class="item-style-tab">
    {{item_style_groups}}
  </section>
  <div class="option-group">
    <span>Export: </span>
    <label class="custom-checkbox" id="all-content-checkbox">
      <input type="checkbox" id="download1" name="download1">
      <span class="checkmark"></span>
      <span class="check-label">All Content</span>
    </label>
  </div>
</div>
<script type="text/html" id="kg-tpl-font-source">
  <div class="option-field kg-font-source-field">
    <details class="kg-accordion">
      <summary class="kg-accordion-summary">
        <span class="option-label">Custom Font
          <span class="info-icon" tabindex="0" role="note" aria-label="Help" onclick="event.preventDefault();">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <span class="info-tooltip">
              You can load external font with url of src of font in Font Source.
              <span class="info-tooltip-actions">
                <button class="btn btn-secondary" id="item_font_load_pw" type="button"
                  onclick="loadExampleFont('https://fonts.gstatic.com/s/playwritevn/v11/mtG94_hXJqPSu8nf5RBY5i0w3Q.woff2', 'Playwrite VN')">Playwrite
                  VN</button>
                <button class="btn btn-secondary" id="item_font_load_tt" type="button"
                  onclick="loadExampleFont('https://fonts.gstatic.com/s/titilliumweb/v19/NaPDcZTIAOhVxoMyOr9n_E7ffBzCGItzYw.woff2', 'Titillium Web')">Titillium
                  Web</button>
              </span>
            </span>
          </span>
        </span>
        <svg class="kg-accordion-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6"></path>
        </svg>
      </summary>
      <div class="kg-accordion-body">
        <div class="option-field-row">
          <input id="item_font_src" type="text" placeholder="https://.../font.woff2" aria-label="Font source URL">
          <button class="btn btn-secondary" id="item_font_load" type="button" onclick="loadFontFromUrl()">Load Font</button>
        </div>
      </div>
    </details>
  </div>
</script>
