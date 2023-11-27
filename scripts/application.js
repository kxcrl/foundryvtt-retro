// Note: Throughout this module you will see many things multiplied by -1.
// PIXI.js uses a positive y axis, unlike in CSS where everything has an inverted y value
// and positive numbers go down the page. In PIXI.js terms, to start at the top of a
// sprite sheet and go down, we want to move in the negative y direction.
let DOWN = 0; // First square of the sprite sheet.
let LEFT = -1; // Second
let UP = -2; // Third
let RIGHT = -3; // Fourth

let FRAME = 0;
let FRAME_RATE = 5;
let TILE_SIZE = 64;


function animationTick(token) {
  if (FRAME % FRAME_RATE !== 0) { return; };
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

function getMoveKey() {
  if (game.keyboard.moveKeys.has('down')) { return DOWN; };
  if (game.keyboard.moveKeys.has('left')) { return LEFT; };
  if (game.keyboard.moveKeys.has('up')) { return UP; };
  if (game.keyboard.moveKeys.has('right')) { return RIGHT; };
}

function controlSprite(token, changes) {
  if (!game.keyboard.moveKeys.size) { return; };
  if (!token.controlled) { return; };

  const tilingSprite = token.tokenSprite.children[0];
  const spriteHeight = token.document.getFlag('foundryvtt-retro', 'sprite-height') || 1;
  const movementOffset = TILE_SIZE * spriteHeight * getMoveKey()
  let animationOffset = 0;

  if (changes.x || changes.y) {
    tilingSprite.tilePosition.x = 0;
    animationOffset = TILE_SIZE * spriteHeight * -4;
  };

  tilingSprite.tilePosition.y = movementOffset + animationOffset;

  // 250 is the hardcoded amount of time in Foundry that movement animation occurs for
  // Shortly after that, stop the walking animation
  if (animationOffset) {
    setTimeout(() => {
      tilingSprite.tilePosition.y = movementOffset;
    }, 300);
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

function setupAnimation(token) {
  const tilingSprite = token.tokenSprite.children[0];

  // PIXI.js sets a 1px empty texture by default to avoid undefined errors.
  // We need to wait for our real texture to load.
  if (tilingSprite.texture.width == 1 && tilingSprite.texture.height == 1) {
    return setTimeout(setupAnimation, 100, token);
  }

  const spriteHeight = token.document.getFlag('foundryvtt-retro', 'sprite-height') || 1;

  if (tilingSprite.texture.height > TILE_SIZE * (spriteHeight - 1) * 4) {
    token.document.setFlag('foundryvtt-retro', 'has-walking-animation', 'true')
  }
  if (tilingSprite.texture.width > TILE_SIZE) {
    canvas.app.ticker.add(() => {
      animationTick(token);
    });
  }
}

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

  setupAnimation(token);
};

function onDestroyToken(token) {
  token.tokenSprite.removeChildren();
};

function onInit() {
  canvas.app.ticker.add(() => { FRAME += 1; });
};

function onCanvasReady() {
  TILE_SIZE = canvas.grid.size;
};

function onPreUpdateToken(token, changes, options, userId) {
  // The Token that is sent here is a SimpleTokenDocument, not a SimpleToken.
  // This gets the SimpleToken, which is what every other method uses and returns.
  token = token.object;
  if (!token.tokenSprite) { return; };

  controlSprite(token, changes)
};

function onRefreshToken(token) {
  if ( token.tokenSprite ) {
    const { x, y } = token.document;
    token.tokenSprite.position.set(x, y);
    token.tokenSprite.zIndex = y / TILE_SIZE;
    token.mesh.zIndex = y / TILE_SIZE;
  }
};

Hooks.once('ready', onInit);
Hooks.once('canvasReady', onCanvasReady);

Hooks.on('drawGridLayer', gridLayer => {
  gridLayer.tokenSprites = gridLayer.addChildAt(new PIXI.Container(), gridLayer.getChildIndex(gridLayer.borders));
  gridLayer.tokenSprites.sortableChildren = true;
});
Hooks.on('drawToken', onDrawToken);
Hooks.on('destroyToken', onDestroyToken);
Hooks.on('refreshToken', onRefreshToken);
Hooks.on('renderTokenConfig', onConfigRender);
Hooks.on('preUpdateToken', onPreUpdateToken);
