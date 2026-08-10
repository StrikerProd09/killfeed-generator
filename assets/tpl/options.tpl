<div id="options">
  <div class="option-group">
    <span>Export: </span>
    <label class="custom-checkbox" id="all-content-checkbox">
      <input type="checkbox" id="download1" name="download1">
      <span class="checkmark"></span>
      <span class="check-label">All Content</span>
    </label>
  </div>
  <div class="option-group">
    <div class="option-field">
      <span>Player 1: </span>
      <input type="text" id="player_1" value="" placeholder="Player 1">
    </div>
    <div class="option-field">
      <span>Player 2: </span>
      <input type="text" id="player_2" value="" placeholder="Player 2">
    </div>
    <button class="btn btn-primary" onclick="players_apply()">Apply</button>
  </div>
  {{additionals_toggles}}
  <div class="option-group">
    <span>Background Color: </span>
    <button class="btn btn-secondary" id="bright" onclick="bright()">Bright</button>
    <button class="btn btn-secondary" id="dark" onclick="dark()">Dark</button>
    <input type="text" id="background_overlay" value="" placeholder="Hex Color">
    <button class="btn btn-primary" onclick="background_apply()">Apply</button>
  </div>
  <section class="item-style-tab">
    <h3>Item Style</h3>
    {{item_style_groups}}
  </section>
</div>
<script type="text/html" id="rkg-tpl-font-source">
  <div class="option-group">
    <span>Font Source:
      <span class="info-icon" tabindex="0" role="note" aria-label="Help">
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
    <input id="item_font_src" type="text" placeholder="https://.../font.woff2">
    <button class="btn btn-secondary" id="item_font_load" onclick="loadFontFromUrl()">Load Font</button>
  </div>
</script>