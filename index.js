
var spritesheet = require('./lib/spritesheet.js');

function test() {
	var s = new spritesheet.Spritesheet("gfx", "static");
	s.run();
	return true;
};

test();
