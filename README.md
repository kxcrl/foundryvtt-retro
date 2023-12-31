### FoundryVTT Retro

A module for recreating classic adventure games within FoundryVTT using the systems pioneered by Rogue and the early roguelikes, at the graphical level of old consoles.

![FoundryVTT_Retro](https://github.com/kxcrl/foundryvtt-retro/assets/2732584/fe971bbf-3db5-4770-a626-949f194a0843)

An animation system based on the original NES with support for:
- Sprite sheets
- Directional sprites
- Keyboard movement events
- Continuous idle and walk animations
- Custom animation lengths for each sprite

### How to use

- Settings for sprites can be found in the Prototype Token section of an Actor.
- Examples of valid sprite sheets can be found in `sprites` folder, and can be used as a template for making your own.
- Your sprite sheet must be based on a grid that matches your grid settings in FoundryVTT.
  - 64px is highly recommended as it supports the widest range of sprites that are available, but any size is technically possible.
  - It is also recommended to use sprites with a transparent background.
- Sprites that face different directions must be placed along the y axis in clockwise order: Down, Left, Up, Right
  - If a sprite sheet only has one grid square on the y axis, movement controls will be ignored and it will be rendered as is.
- Add any animation frames as grid squares along the x axis and they will be animated automatically.
- Add any walk animations after the four rows of idle frames to add walking.
- If you wish to use tall sprites (i.e. those found in games like Final Fantasy or Chrono Trigger), simply double the height of the grid (for example, 64x128 instead of 64x64) and set the Sprite Height to 2 (or more) in the settings.
  - The feet of your sprite should be towards the bottom of whatever grid square they are inside of, or the character will appear to be floating off the ground in Foundry.

### Tips and Resources

- Kenney has many excellent sprite sheets that are available for free.
  - Check out the [1-bit Pack](https://www.kenney.nl/assets/1-bit-pack) or the [Micro Roguelike Pack](https://www.kenney.nl/assets/micro-roguelike)
- Itch.io is easy to search and has many tilesets and sprite sheets from creators around the world, along with an excellent tagging system.
  - Try the [1-bit tag](https://itch.io/game-assets/tag-1-bit)
  - Or the [tileset tag](https://itch.io/game-assets/tag-tileset)
- Original sprite sheets for specific (public domain, of course) games are relatively easy to find by just searching for the title and "sprites" or "sprite sheet".
  - Note that they will need to be adapted to a grid to work with this module in most cases.
- You can create a character using generators like the [Universal LPC Sprite Sheet Character Generator](https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/)
- Pick up [Aseprite](https://www.aseprite.org/) and make your own!
  - The sprites used in the video above are custom, but based on dalis' warrior sprite from their free 1-bit pack. [Check out their work here.](https://dalis-zo.itch.io/1-bit-medieval-character-pack)
- Alternatively, if you'd like to use Photoshop to create and scale your sprites, it only requires a few adjustments.
  - Open Grid settings in `Edit > Settings > Guides, Grid & Slices` and set the `Grideline Every` to `64` and `Pixels`
  - Be sure to set `Interpolation` to `Nearest Neighbor` in the context menu at the top of the screen while using the Transform tool to avoid anti-aliasing.
  - Additionally, an easy way to get rid of single color backgrounds is to use the Magic Wand tool, just be sure to uncheck Anti-alias and Contiguous in the top context menu.
  - For drawing individual pixels, it's easiest to use the Pencil tool. To erase them, set the Eraser to Pencil as well in the top context menu while using it.

### Support

This module is provided free of charge. If you'd like to help make maintaining it possible, you can support me here:

[Bandcamp](https://ipso.bandcamp.com)
[YouTube](https://youtube.com/@nox_ipso)
[Website](https://ipso.studio)
