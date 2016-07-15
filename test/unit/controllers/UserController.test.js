require("sails-test-helper");

var token;
var username = 'testuser123',
	password = '123456';

describe(TEST_NAME, function() {

	before(function(done){
		User.destroy({username: username}).exec(function(err){
			if (err) return done(err);
			done();
		});
	});

	describe("GET homepage", function() {
    	it("should be successful", function(done) {
      		request.get("/")
        	.expect(200)
        	.end(done);
    	});
  	});

	describe("create user", function(){
		var path = '/user';

		it("should get 401 with err: Password does not match!", function(done){
			request.post(path)
			.send({username: username})
			.expect(401, {err: 'Password does not match!'})
			.end(done);
		});

		it("should get 201 with new user", function(done){
			request.post(path)
			.send({username: username, password: password, confirmPassword: password})
			.expect(201)
			.expect(function(res){
				res.body.user.should.not.be.null;
				res.body.token.should.not.be.null;
			})
			.end(done);
		});
	});

  	describe("log user in", function(){
  		var path = '/user/login';

  		it("should get 401 with err: username and password required", function(done){
  			request.get(path)
  			.expect(401,{err: 'username and password required'})
  			.end(done);
  		});

  		it ("should get 401 with err: invalid username or password", function(done){
  			request.get(path)
  			.query({username: 'napp', password: '1234567'})
  			.expect(401, {err: 'invalid username or password'})
  			.end(done);
  		})

  		it ("should get 401 with err: invalid username or password", function(done){
  			request.get(path)
  			.query({username: 'nap', password: '1234567'})
  			.expect(401, {err: 'invalid username or password'})
  			.end(done);
  		})

  		it ("should get 200 with token", function(done){
  			request.get(path)
  			.query({username: username, password: password})
  			.expect(200)
  			.end(function(err, res){
  				if (err) return done(err);

  				res.body.token.should.not.be.null;
  				token = res.body.token;

  				done();
  			});
  		});
  	});

	describe("add new history", function(){

		var path = '/user/history';

		it("should get 401 with err: No authorization header found", function(done){
			request.post(path)
			.expect(401, {err: 'No authorization header found'})
			.end(done);
		});

		it("should get 401 with err: Invalid Token!", function(done){
			request.post(path)
			.set('Authorization', 'Bearer kalsdfjlasdjfklasdjflkasdjflkj')
			.expect(401, {err: 'Invalid Token!'})
			.end(done);
		});

		it("should get 400 for not providing searchKey", function(done){
			request.post(path)
			.set('Authorization', 'Bearer ' + token)
			.expect(400)
			.end(done);
		});

		it("should get 201 for success and searches include cambodia", function(done){
			request.post(path)
			.set('Authorization', 'Bearer ' + token)
			.send({searchKey: 'cambodia'})
			.expect(201)
			.expect(function(res){
				res.body.user.searches.should.not.be.null;
				res.body.user.searches.should.include('cambodia');
			})
			.end(done);
		});

		it("should get 202 for history already existed", function(done){
			request.post(path)
			.set('Authorization', 'Bearer ' + token)
			.send({searchKey: 'cambodia'})
			.expect(202)
			.end(done);
		});

		it("should get 202 for history already existsed casesensative", function(done){
			request.post(path)
			.set('Authorization', 'Bearer ' + token)
			.send({searchKey: 'CAMbodiA'})
			.expect(202)
			.end(done);
		});
	});
});