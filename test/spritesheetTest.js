var fs = require("fs-extra");
var expect = require("chai").expect;
var compile = require("../lib/spritesheet.js").compile;

function testdir(name, cb) {
	compile("test/testsprites/" + name, "test/testsprites/out/" + name, {}, cb);
};

describe("spritesheet", function() {
	describe("#compile()", function() {
		it("should report an error for a non-existent directory", function(done) { 
			testdir("nonexistent", function(err, result) {
				expect(err).to.not.equal(null);
				done();
			});
		});
		it("should report an error for an empty directory", function(done) { 
			if(!fs.exists("test/testsprites/empty")) {
				fs.mkdir("test/testsprites/empty");
			}
			testdir("empty", function(err, result) {
				expect(err).to.not.equal(null);
				done();
			});
		});
		it("should successfully compile single test sprite", function(done) { 
			testdir("onesprite", function(err, result) {
				expect(err).to.equal(null);
				expect(result.spriteCount).to.equal(1);
				done();
			});
		});
		describe("complex sheet", function() {
			var err;
			var result;
			before(function(before_done) {
				testdir("animations", function(e, r) {
					err = e;
					result = r;
					before_done();
				});
			});

			var getframe = function(name) {
				for(var i = 0; i < result.imagedata.length; ++i) {
					var f = result.imagedata[i];
					if(f.animname == name) {
						return f;
					}
				}
				return null;
			};

			it("should not have an error", function() {
				expect(err).to.equal(null);
			});
			it("should generate an animation", function() {
				expect(result.spriteCount).to.equal(15);
			});
			
			it("should allow for underscore in names", function() {
				var f = getframe("offset_center");
				expect(f).to.not.equal(null);
			});
			it("should default to center offset", function() {
				var f = getframe("offset_center");
				expect(f.ox).to.equal(f.width / 2);
				expect(f.oy).to.equal(f.height / 2);
			});

			describe("suffix options", function() {
				it("t: top voffset", function() {
					var f = getframe("hoffsettl");
					expect(f.oy).to.equal(0);
				});
				it("m: mid voffset", function() {
					var f = getframe("hoffsetmc");
					expect(f.oy).to.equal(f.height / 2);
				});
				it("b: bottom voffset", function() {
					var f = getframe("hoffsetbr");
					expect(f.oy).to.equal(f.height);
				});
				it("l: left hoffset", function() {
					var f = getframe("hoffsettl");
					expect(f.ox).to.equal(0);
				});
				it("c: center hoffset", function() {
					var f = getframe("hoffsetmc");
					expect(f.ox).to.equal(f.width / 2);
				});
				it("r: right hoffset", function() {
					var f = getframe("hoffsetbr");
					expect(f.ox).to.equal(f.width);
				});
				it("subsequent frames adopt offset of first frame");
				it("s: specified framerate");
				it("p: ping pong sequence");
				it("d: duplicate frame [delay]");
			});
		});
	});
});
