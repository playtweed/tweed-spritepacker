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

			it("should not have an error", function(done) {
				expect(err).to.equal(null);
				done();
			});
			it("should generate an animation", function(done) {
				expect(result.spriteCount).to.equal(5);
				done();
			});
			
			it("should default to center offset");
			it("should register top-left offset from suffix");
			it("should register specified framerate from suffix");
		});
	});
});
