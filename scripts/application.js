function spriteControls(tilingSprite) {
  if (game.keyboard.moveKeys.has('up')) {
    tilingSprite.tilePosition.y = 0;
  }

  if (game.keyboard.moveKeys.has('right')) {
    tilingSprite.tilePosition.y = -100;
  }

  if (game.keyboard.moveKeys.has('down')) {
    tilingSprite.tilePosition.y = -200;
  }

  if (game.keyboard.moveKeys.has('left')) {
    tilingSprite.tilePosition.y = -300;
  }
}

function onConfigRender(config, html) {
  // TODO: Use a template to render the config, use the filepicker handleBars helper to select the image
  // let renderedConfig = await renderTemplate('../templates/config.hbs')

  let spriteSheetPath = config.token.getFlag('foundryvtt-retro', 'sprite-sheet-path')

  config.position.width = 540;
  config.setPosition(config.position);

  const nav = html.find('nav.sheet-tabs.tabs[data-group="main"]');
  let btn = $('<button>')
      .addClass('file-picker')
      .attr('type', 'button')
      .attr('data-type', "imagevideo")
      .attr('data-target', "img")
      .attr('title', "Browse Files")
      .attr('tabindex', "-1")
      .html('<i class="fas fa-file-import fa-fw"></i>')
      .click(function (event) {
          const fp = new FilePicker({
              type: "imagevideo",
              current: $(event.currentTarget).prev().val(),
              callback: path => {
                  $(event.currentTarget).prev().val(path);
              }
          });
          return fp.browse();
      });

  nav.append($(`
    <a class="item" data-tab="sprite">
      <i class="fa-solid fa-chess-board"></i>
      ${game.i18n.localize('config.title')}
    </a>
  `));

  nav.parent().find('footer').before($(`
  <div class="tab" data-tab="sprite">
    <div class="form-group">
      <label>${game.i18n.localize('config.sheet-name')}</label>
      <div class="form-fields">
        <input type="text" value="${spriteSheetPath}" name="flags.foundryvtt-retro.sprite-sheet-path" data-target="flags.foundryvtt-retro.sprite-sheet-path">
      </div>
    </div>
  </div>
  `));

  btn.clone(true).insertAfter($('input[name="flags.foundryvtt-retro.sprite-sheet-path"]', html).css({ 'flex-basis': 'unset', 'flex-grow': 1 }));
};

function onDrawToken(token) {
  const texture = PIXI.Texture.from(token.document.getFlag('foundryvtt-retro', 'sprite-sheet-path'));
  const tilingSprite = new PIXI.TilingSprite(texture, 100, 100,);

  if (!token.tokenSprite) {
    token.tokenSprite = canvas.grid.tokenSprites.addChild(new PIXI.Container());
  }

  token.tokenSprite.addChild(tilingSprite);

  canvas.app.ticker.add(() => {
    spriteControls(tilingSprite);
  });
};

function onRefreshToken(token) {
  if ( token.tokenSprite ) {
    const { x, y } = token.document;
    token.tokenSprite.position.set(x, y);
  }
};

Hooks.once('init', async function() {
});

Hooks.once('ready', async function() {
});

Hooks.on('drawGridLayer', gridLayer => {
	gridLayer.tokenSprites = gridLayer.addChildAt(new PIXI.Container(), gridLayer.getChildIndex(gridLayer.borders));
});
Hooks.on('drawToken', onDrawToken);
Hooks.on('refreshToken', onRefreshToken);
Hooks.on('renderTokenConfig', onConfigRender);
