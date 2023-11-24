const TILE_SIZE = 64;

function spriteControls(token) {
  if (!token.controlled) { return; }

  const keyUp = game.keyboard.moveKeys.has('up');
  const keyDown = game.keyboard.moveKeys.has('down');
  const keyLeft = game.keyboard.moveKeys.has('left');
  const keyRight = game.keyboard.moveKeys.has('right');

  const downLeft = TILE_SIZE * 0;
  const downRight = TILE_SIZE * -1;
  const upLeft = TILE_SIZE * -2;
  const upRight = TILE_SIZE * -3;

  const tilingSprite = token.tokenSprite.children[0];
  const facingDirection = tilingSprite.tilePosition.y;

  const isFacingDownLeft = facingDirection == downLeft;
  const isFacingDownRight = facingDirection == downRight;
  const isFacingUpLeft = facingDirection == upLeft;
  const isFacingUpRight = facingDirection == upRight;
  
  if (keyUp) {
    tilingSprite.tilePosition.y = isFacingDownLeft || isFacingUpLeft ? upLeft : upRight;
  }

  if (keyDown) {
    tilingSprite.tilePosition.y = isFacingDownLeft || isFacingUpLeft ? downLeft : downRight;
  }

  if (keyLeft) {
    tilingSprite.tilePosition.y = isFacingUpLeft || isFacingUpRight ? upLeft : downLeft;
  }

  if (keyRight) {
    tilingSprite.tilePosition.y = isFacingUpLeft || isFacingUpRight ? upRight : downRight;
  }
}

function topDownControls(token) {
  const tilingSprite = token.tokenSprite.children[0];

  if (!token.controlled) {
    return;
  }

  if (game.keyboard.moveKeys.has('up')) {
    tilingSprite.tilePosition.y = TILE_SIZE * 0;
  }

  if (game.keyboard.moveKeys.has('right')) {
    tilingSprite.tilePosition.y = TILE_SIZE * -1;
  }

  if (game.keyboard.moveKeys.has('down')) {
    tilingSprite.tilePosition.y = TILE_SIZE * -2;
  }

  if (game.keyboard.moveKeys.has('left')) {
    tilingSprite.tilePosition.y = TILE_SIZE * -3;
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
  const tilingSprite = new PIXI.TilingSprite(texture, TILE_SIZE, TILE_SIZE,);

  if (!token.tokenSprite) {
    token.tokenSprite = canvas.grid.tokenSprites.addChild(new PIXI.Container());
  }

  token.tokenSprite.addChild(tilingSprite);

  canvas.app.ticker.add(() => {
    spriteControls(token);
  });
};

function onDestroyToken(token) {
  token.tokenSprite.removeChildren();
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
Hooks.on('destroyToken', onDestroyToken);
Hooks.on('refreshToken', onRefreshToken);
Hooks.on('renderTokenConfig', onConfigRender);
