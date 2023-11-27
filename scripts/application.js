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
  const currentAnimation = token.animFlags['current-animation'];
  const currentAnimationFrameFlag = "sprite-" + currentAnimation + "-frames";

  const defaultMaxFrame = tilingSprite.texture.width / TILE_SIZE;
  const maxFrame = token.document.getFlag('foundryvtt-retro', currentAnimationFrameFlag);
  const currentFrame = 1 + tilingSprite.tilePosition.x / TILE_SIZE;

  if (currentFrame == maxFrame || currentFrame == defaultMaxFrame) {
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

  const spriteHeight = token.document.getFlag('foundryvtt-retro', 'sprite-height') || 1;

  token.animFlags['idle-offset'] = TILE_SIZE * spriteHeight * getMoveKey();
  token.animFlags['walk-offset'] = TILE_SIZE * spriteHeight * -4;

  if (changes.x) { token.animFlags['destination-x'] = changes.x; };
  if (changes.y) { token.animFlags['destination-y'] = changes.y; };
  if (token.animFlags['has-walk-cycle']) { animateWalkCycle(token) };
}

function animateWalkCycle(token) {
  const destinationX = token.animFlags['destination-x'];
  const destinationY = token.animFlags['destination-y'];
  const idleOffset = token.animFlags['idle-offset'];
  const walkOffset = token.animFlags['walk-offset'];
  const tilingSprite = token.tokenSprite.children[0];

  if (token.position.x === destinationX && token.position.y === destinationY) {
    token.animFlags['current-animation'] = 'idle';
    tilingSprite.tilePosition.x = 0;
    tilingSprite.tilePosition.y = idleOffset;
  } else {
    token.animFlags['current-animation'] = 'walk';
    tilingSprite.tilePosition.y = idleOffset + walkOffset;
    return setTimeout(animateWalkCycle, 250, token);
  }
}

function getImageData(url) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
}

async function calculateMaxFrame(spriteSheetPath) {
  let image = await getImageData(spriteSheetPath);
  return image.width / TILE_SIZE;
}

async function onConfigRender(config, html) {
  const prototypeToken = config.token;

  let spriteSheetPath = prototypeToken.getFlag('foundryvtt-retro', 'sprite-sheet-path');
  let spriteHeight = prototypeToken.getFlag('foundryvtt-retro', 'sprite-height') || 1;
  let spriteIdleFrames = prototypeToken.getFlag('foundryvtt-retro', 'sprite-idle-frames') || 0;
  let spriteWalkFrames = prototypeToken.getFlag('foundryvtt-retro', 'sprite-walk-frames') || 0;

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
    .click((event) => {
      const fp = new FilePicker({
        type: "imagevideo",
        current: $(event.currentTarget).prev().val(),
        callback: async function(spriteSheetPath) {
          $(event.currentTarget).prev().val(spriteSheetPath);

          let maxFrame = await calculateMaxFrame(spriteSheetPath);

          document.querySelector("input[name='flags.foundryvtt-retro.sprite-idle-frames']").value = maxFrame;
          document.querySelector("input[name='flags.foundryvtt-retro.sprite-walk-frames']").value = maxFrame;
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
      <div class="form-group">
        <label>${game.i18n.localize('config.sprite-idle-frames')}</label>
        <input type="text" value="${spriteIdleFrames}" name="flags.foundryvtt-retro.sprite-idle-frames" data-target="flags.foundryvtt-retro.sprite-idle-frames">
      </div>
      <div class="form-group">
        <label>${game.i18n.localize('config.sprite-walk-frames')}</label>
        <input type="text" value="${spriteWalkFrames}" name="flags.foundryvtt-retro.sprite-walk-frames" data-target="flags.foundryvtt-retro.sprite-walk-frames">
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

  const spriteHeight = token.document.getFlag('foundryvtt-retro', 'sprite-height');

  if (!token.animFlags) {
    token.animFlags = {
      'current-animation': 'idle',
      'destination-x': tilingSprite.position.x,
      'destination-y': tilingSprite.position.y,
      'has-walk-cycle': false,
      'idle-offset': 0,
      'walk-offset': 0
    }
  }

  if (tilingSprite.texture.width > TILE_SIZE) {
    canvas.app.ticker.add(() => {
      animationTick(token);
    });
  } else {
    return;
  }

  if (tilingSprite.texture.height > TILE_SIZE * spriteHeight * 4) {
    token.animFlags['has-walk-cycle'] = true;
  }
}

function onDrawToken(token) {
  const spriteHeight = token.document.getFlag('foundryvtt-retro', 'sprite-height');
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
Hooks.on('canvasReady', onCanvasReady);
Hooks.on('drawGridLayer', (gridLayer) => {
  gridLayer.tokenSprites = gridLayer.addChildAt(new PIXI.Container(), gridLayer.getChildIndex(gridLayer.borders));
  gridLayer.tokenSprites.sortableChildren = true;
});
Hooks.on('drawToken', onDrawToken);
Hooks.on('destroyToken', onDestroyToken);
Hooks.on('refreshToken', onRefreshToken);
Hooks.on('renderTokenConfig', onConfigRender);
Hooks.on('preUpdateToken', onPreUpdateToken);
