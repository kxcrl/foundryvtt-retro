let FRAME = 0;
let TILE_SIZE = 64;

function animationTick(token) {
  if (FRAME % 15 !== 0) { return; };
  if (!token.tokenSprite.children.length) { return; };

  const tilingSprite = token.tokenSprite.children[0];

  // Position is the left edge of the sprite while width is the right edge,
  // so we need to add 1 to position or subtract 1 from width
  const currentFrame = 1 + tilingSprite.tilePosition.x / TILE_SIZE;
  const maxFrame = tilingSprite.texture.width / TILE_SIZE;

  if (currentFrame == maxFrame) {
    tilingSprite.tilePosition.x = 0;
  } else {
    tilingSprite.tilePosition.x += TILE_SIZE;
  }
}

function diagonalSpriteControls(token) {
  if (!token.controlled) { return; }

  const spriteHeight = token.document.getFlag('foundryvtt-retro', 'sprite-height') || 1;

  const keyUp = game.keyboard.moveKeys.has('up');
  const keyDown = game.keyboard.moveKeys.has('down');
  const keyLeft = game.keyboard.moveKeys.has('left');
  const keyRight = game.keyboard.moveKeys.has('right');

  const downLeft = TILE_SIZE * 0 * spriteHeight;
  const downRight = TILE_SIZE * -1 * spriteHeight;
  const upLeft = TILE_SIZE * -2 * spriteHeight;
  const upRight = TILE_SIZE * -3 * spriteHeight;

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

function spriteControls(token) {
  const tilingSprite = token.tokenSprite.children[0];
  const spriteHeight = token.document.getFlag('foundryvtt-retro', 'sprite-height') || 1;

  if (!token.controlled) {
    return;
  }

  if (game.keyboard.moveKeys.has('down')) {
    tilingSprite.tilePosition.y = TILE_SIZE * 0 * spriteHeight;
  }

  if (game.keyboard.moveKeys.has('left')) {
    tilingSprite.tilePosition.y = TILE_SIZE * -1 * spriteHeight;
  }

  if (game.keyboard.moveKeys.has('up')) {
    tilingSprite.tilePosition.y = TILE_SIZE * -2 * spriteHeight;
  }

  if (game.keyboard.moveKeys.has('right')) {
    tilingSprite.tilePosition.y = TILE_SIZE * -3 * spriteHeight;
  }
}

async function onConfigRender(config, html) {
  // TODO: Use a template to render the config, use the filepicker handleBars helper to select the image
  // let renderedConfig = await renderTemplate('../templates/config.hbs')

  let spriteSheetPath = config.token.getFlag('foundryvtt-retro', 'sprite-sheet-path');
  let spriteHeight = config.token.getFlag('foundryvtt-retro', 'sprite-height');

  if (!spriteHeight) {
    spriteHeight = 1;
    await config.token.setFlag('foundryvtt-retro', 'sprite-height', 1);
  }

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
    <div>
      <div class="form-group">
        <label>${game.i18n.localize('config.sheet-name')}</label>
        <div class="form-group">
          <input type="text" value="${spriteSheetPath || "None"}" name="flags.foundryvtt-retro.sprite-sheet-path" data-target="flags.foundryvtt-retro.sprite-sheet-path">
        </div>
      </div>
      <div class="form-group">
        <label>${game.i18n.localize('config.sprite-height')}</label>
        <input type="text" value="${spriteHeight}" name="flags.foundryvtt-retro.sprite-height" data-target="flags.foundryvtt-retro.sprite-height">
      </div>
    </div>
  </div>
  `));

  btn.clone(true).insertAfter($('input[name="flags.foundryvtt-retro.sprite-sheet-path"]', html).css({ 'flex-basis': 'unset', 'flex-grow': 1 }));
};

function onDrawToken(token) {
  const spriteHeight = token.document.getFlag('foundryvtt-retro', 'sprite-height') || 1;
  const spriteSheet = PIXI.Texture.from(token.document.getFlag('foundryvtt-retro', 'sprite-sheet-path'));

  if (!spriteSheet) { return; };

  token.document.update({ alpha: 0 }, { animate: false })

  const tilingSprite = new PIXI.TilingSprite(spriteSheet, TILE_SIZE, TILE_SIZE * spriteHeight,);

  // spriteHeight - 1 because a 1x1 tile should have no offset, so start at 0
  if (spriteHeight > 1) { tilingSprite.localTransform.ty = TILE_SIZE * (spriteHeight - 1) * -1; };

  if (!token.tokenSprite) {
    token.tokenSprite = canvas.grid.tokenSprites.addChild(new PIXI.Container());
  }

  token.tokenSprite.addChild(tilingSprite);


  // There is a callback in PIXI.js that has to fire before we can
  // check the texture height and width. It's next on the stack, so we
  // are just lifting this out of the current function with a tiny timeout.
  setTimeout(() => {
    if (tilingSprite.texture.height > TILE_SIZE * (spriteHeight - 1)) {
      canvas.app.ticker.add(() => {
        spriteControls(token);
      });
    }

    if (tilingSprite.texture.width > TILE_SIZE) {
      canvas.app.ticker.add(() => {
        animationTick(token);
      });
    }
  }, 10);
};

function onDestroyToken(token) {
  token.tokenSprite.removeChildren();
};

function onInit() {
  canvas.app.ticker.add(() => { FRAME += 1; });
};

function onRefreshToken(token) {
  if ( token.tokenSprite ) {
    const { x, y } = token.document;
    token.tokenSprite.position.set(x, y);
    token.tokenSprite.zIndex = y / TILE_SIZE;
    token.mesh.zIndex = y / TILE_SIZE;
  }
};

Hooks.once('ready', async function() {
  onInit();
});

Hooks.on('canvasReady', async function() {
  TILE_SIZE = canvas.grid.size;
})

Hooks.on('drawGridLayer', gridLayer => {
  gridLayer.tokenSprites = gridLayer.addChildAt(new PIXI.Container(), gridLayer.getChildIndex(gridLayer.borders));
  gridLayer.tokenSprites.sortableChildren = true;
});
Hooks.on('drawToken', onDrawToken);
Hooks.on('destroyToken', onDestroyToken);
Hooks.on('refreshToken', onRefreshToken);
Hooks.on('renderTokenConfig', onConfigRender);
