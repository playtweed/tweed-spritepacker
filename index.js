
var spritesheet = require('./lib/spritesheet.js');
var fs = require('fs');

function test() {
	fs.watch('gfx', function(ev, fn) {
		console.log(ev);
		spritesheet.compile("gfx", "static");
	});
};

test();
