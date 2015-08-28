# gamesprites
A Node.js script for creating spritesheets for use in games.

Currently it outputs layout/animation data suitable for using with CreateJS, though 
support for other engines could be added in the future.

## Usage

Call `spritesheet.compile(dir, outname)` where `dir` is a path to a directory of images to be
packed into a spritesheet, and `outname` is where to save the output image and data, sans extension.

For example, `spritesheet.compile("resources/sprites", "static/images/spritesheet")` will pack
all of the images in resources/sprites and output static/images/spritesheet.png and static/images/spritesheet.json.
