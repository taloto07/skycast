require("sails-test-helper");

var username = 'testuser123456',
	password = '123456';

describe(TEST_NAME, function(){

	before(function(done){
		User.destroy({username: username}).exec(function(err){
			if (err) return done(err);
			done();
		});
	});

	describe(".create()", function(){
		it("should fail creating user", function(done){
			User.create().exec(function(err, user){
				err.should.not.be.null;
				done();
			});
		});

		it("should success creating user", function(done){
			User.create({username: username, password: password}).exec(function(err, user){
				if (err) return done(err);
				user.should.not.be.null;
				done();
			})
		});
	});
});