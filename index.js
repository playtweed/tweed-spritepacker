
var spritesheet = require('./lib/spritesheet.js');
var fs = require('fs');

function testwatch() {
	fs.watch('gfx', function(ev, fn) {
		spritesheet.compile("gfx", "static");
	});
};

module.exports = {
	compile = spritesheet.compile
};
