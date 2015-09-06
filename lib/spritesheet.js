var Jimp = require('jimp');
var fs = require('fs-extra');
var path = require('path');
var async = require('async');

// see if two rectangles overlap. if so, return the distance that A needs to shift
// to the right to avoid overlapping.
function rectshift(a, b) {
	if(a.x > b.x + b.width ||
		a.x + a.width < b.x ||
		a.y > b.y + b.height ||
		a.y + a.height < b.y) {
		return 0;
	} else {
		var overlap = b.x + b.width - a.x;
		return overlap;
	}
};

var formatters = {

	// format for CreateJS framework
	createjs: function(outname, imagedata) {
		var frames = [];
		var animations = {};

		// first pass: set up frame for each image, ensure an animation array is present
		imagedata.forEach(function(im) {
			var ox = Math.floor(im.width / 2);
			var oy = Math.floor(im.height / 2);
			im.frame = frames.length;
			frames.push([im.x, im.y, im.width, im.height, 0, im.ox, im.oy]);
			if(!animations[im.animname]) {
				animations[im.animname] = { frames: [] };
			}
		});

		// re-sort the images to frame order and then push their frame indices
		// into the respective arrays.
		imagedata.sort(function(a, b) { return a.animidx - b.animidx; });
		imagedata.forEach(function(im) {
			animations[im.animname].frames.push(im.frame);
		});

		// put all the data in its appropriate groups and JSONify
		var data = {
			frames: frames,
			animations: animations,
			images: [ outname + ".png" ]
		};
		return JSON.stringify(data, null, 2);
	}
};

function compile(dir, outname, options, callback) {

	// load all images
	var imagedata = [];
	var images = {};
	var animations = {};

	var listing;
	try {
		listing = fs.readdirSync(dir);
	} catch(error) {
		if(callback) {
			callback(new Error("Source sprite directory does not exist."), output);
		}
		return
	}

	if(listing.length == 0) {
		if(callback) {
			callback(new Error("Source sprite directory was empty."), output);
		}
		return;
	}

	var output = {
		spriteCount: 0,
		width: 0,
		height: 0,
		unreadableFiles: []
	};

	// setup calls to load all the images asynchronously; store their dimensions
	var PARTS = /_(\d+)(__(.*))?$/;
	var loadercalls = [];
	listing.forEach(function(filename) {
		var basename = filename.substr(0, filename.lastIndexOf('.')) || filename;
		var imd = {
			name: basename,
			width: 0,
			height: 0,
			x: 0,
			y: 0,
		};
		var options = imd.name.split(PARTS);
		imd.animname = options[0];
		imd.animidx = parseInt(options[1] || '0');
		imd.options = {
			voffset: 'm',
			hoffset: 'c',
			speed: 1,
			pingpong: false,
			delay: 0
		};
		imagedata.push(imd);

		if(options[3]) {
			var opts = options[3].split(/(\w[\d\.]*)/g);
			opts.forEach(function(o) {
				if(o) {
					var option = o[0];
					var value = o.substr(1, o.length-1);
					switch(option) {
						case 't':
						case 'm':
						case 'b':
							imd.options.voffset = option;
							break;
						case 'l':
						case 'c':
						case 'r':
							imd.options.hoffset = option;
							break;
						case 's':
							imd.options.speed = parseFloat(value);
							break;
						case 'p':
							imd.options.pingpong = true;
							break;
						case 'd':
							imd.options.delay = parseInt(value);
							break;
					}
				}
			});
		}

		loadercalls.push(function(callback) {
			var im = new Jimp(dir + '/' + filename, function(err, image) {
				if(err) {
					imd.error = err;
				} else {
					images[imd.name] = image;
					imd.width = image.bitmap.width;
					imd.height = image.bitmap.height;

					switch(imd.options.hoffset) {
						case 'l': imd.ox = 0; break;
						case 'c': imd.ox = imd.width / 2; break;
						case 'r': imd.ox = imd.width; break;
					}

					switch(imd.options.voffset) {
						case 't': imd.oy = 0; break;
						case 'm': imd.oy = imd.height / 2; break;
						case 'b': imd.oy = imd.height; break;
					}
				}
				callback(null, imd);
			});
		});
	});

	// actually perform the above calls and then process everything
	async.parallel(loadercalls, function(err, result) {

		// remove images that haven't loaded properly
		imagedata = imagedata.filter(function(imd) { 
			if(imd.error) {
				output.unreadableFiles.push(imd.name);
				return false;
			} else {
				return true;
			}
		});

		if(listing.length == 0) {
			if(callback) {
				callback(new Error("No readable images in source directory."), output);
			}
			return;
		}

		// figure out the total size of the sheet
		var totalsize = 0;
		for(var i = 0; i < imagedata.length; ++i) {
			var im = imagedata[i];
			totalsize += im.width * im.height;
		}

		var width = Math.ceil(Math.sqrt(totalsize) * 1.1); // this will (hopefully) just result in a roughly square image
		var actualwidth = 0;
		var height = 0;

		// order the images by total pixels
		imagedata.sort(function(a, b) {
			return b.width * b.height - a.width * a.height;
		});

		// begin packing the images, biggest first, by scanline, starting in top left
		for(var i = 0; i < imagedata.length; ++i) {
			var im = imagedata[i];
			im.x = 0;
			im.y = 0;
			for(var j = 0; j < i; ++j) {
				var testim = imagedata[j];
				var shunt = rectshift(im, testim);
				if(shunt) {
					im.x += shunt;
					if(im.x + im.width > width) {
						im.x = 0;
						im.y++;		// scanlines
					}
					j = -1;	
				}
			}
			actualwidth = Math.max(actualwidth, im.x + im.width);
			height = Math.max(height, im.y + im.height);
		}

		output.spriteCount = imagedata.length;
		output.width = width;
		output.height = height;
		output.imagedata = imagedata;

		var outdir = outname;
		fs.ensureDir(path.dirname(outname));

		// save sprite layout data
		var format = 'createjs';
		var data = formatters[format](outname, imagedata);
		fs.writeFileSync(outname + ".js", data);

		// create actual sheet image data
		var sheet = new Jimp(actualwidth, height, function(err, sheet) {
			if(err) {
				if(callback) { callback(err, output); }
			} else {
				// write all images to sheet
				for(var i = 0; i < imagedata.length; ++i) {
					var im = imagedata[i];
					sheet.blit(images[im.name], im.x, im.y);
				}

				// save sheet
				sheet.write(outname + ".png", function(err) { 
					if(callback) { callback(err, output); }
				});
			}
		});

	});
};

module.exports = {
	compile : compile,
};

