# gamesprites
A Node.js script for creating spritesheets for use in games.

Currently it outputs layout/animation data suitable for using with CreateJS, though 
support for other engines could be added in the future.

## Usage

After `sprites = require('gamesprites')`, call `sprites.compile(dir, outname)` where `dir` is a path to a directory of images to be
packed into a spritesheet, and `outname` is where to save the output image and data, sans extension.

For example, `sprites.compile("resources/sprites", "static/images/spritesheet")` will pack
all of the images in resources/sprites and output static/images/spritesheet.png and static/images/spritesheet.json.

## Offsets, Framerates, Animations

The script will pack all valid images in the provided directory into a single texture atlas, and assign names to the animations based on the source images' filenames. If a filename ends with an underscore followed by a number, it'll truncate that and use the number as a cue for ordering within an animation. For example:

- `idle.png` will generate a single-frame animation called "idle".
- `walk_0.png`, `walk_1.png`, `walk_2.png` will generate a three-frame animation called "walk".

Other options can be set by adding a suffix to the filename followed by the options. The options are:

- *l, c, r*: x-offset of the sprite. Left, center, right, respectively.
- *t, m, b*: y-offset. Top, middle, bottom.
- *s*: speed of the animation. _(currently not implemented)_
- *p*: flag the animation as ping-pong. _(currently not implemented)_
- *d*: duplicate this frame._(currently not implemented)_

*s* and *p* affect the whole animation, but only need to be marked on the first frame of that animation.

For example:

- `idle__bc.png` will generate a single frame with a registration point at the bottom-center of the sprite.
- `walk_0__s0.5cm.png`, `walk_1.png`, `walk_2.png` will generate a three-frame animation with a registration point at the center/middle of each frame at half speed.

The frames will just be ordered by the frame number given. That is, `x_0.png`, `x_3.png`, `x_5.png` will generate a three-frame animation in that order; the "missing" frames 1, 2, and 4 won't break anything.
