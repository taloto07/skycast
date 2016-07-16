/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('request');

module.exports = {
	/*
    |--------------------------------------------------------------------------
    | Create user account
    |--------------------------------------------------------------------------
    | @parameter: - username, password, and confirmPassword
    | @required : - username, password, and confirmPassword are not empty.
    |			  - password == confirmPassword.
    |			  - username does not exist yet.
    | @modified : - User model
    | @effect   : - new user created with encrypted password
    | @return   : - 201 with user object and token if success, 
    |				otherwise 401 if password or confirmPassword does not match or
    |				empty
    */
	create: function(req, res, next){
		var password = req.param('password');
		var confirmPassword = req.param('confirmPassword');
		
		if ( !password || !confirmPassword || password != confirmPassword ){
			return res.json(401, {err: 'Password does not match!'});
		}

		User.create(req.params.all()).exec(function(err, user){
			if (err) return res.json(err.status, {err: err});

			if (user){
				// NOTE: payload is { id: user.id}
        		res.json(201, {user: user, token: jwToken.issue({id: user.id})});
			}
		});
	},

	/*
    |--------------------------------------------------------------------------
    | Log in
    |--------------------------------------------------------------------------
    | @parameter: - username and password
    | @required : - username and password are not empty.
    | @modified : 
    | @effect   : 
    | @return   : - 200 with user object and token if success, 
    |				otherwise 401 if username or password is empty and can't find
    |				username, or 403 password doesn't match user's password
    */
	login: function(req, res, next){
		var username = req.param('username');
		var password = req.param('password');

		if (!username || !password){
			return res.json(401, {err: 'username and password required'});
		}

		User.findOne({username: username}, function(err, user){
			if (err) return res.json(500, {err: err});

			if (!user) return res.json(401, {err: 'invalid username or password'});

			User.comparePassword(password, user, function(err, valid){
				if (err) return res.json(403, {err: 'forbidden'});

				if (!valid){
					return res.json(401, {err: 'invalid username or password'});
				} else {
					res.json({
						user: user,
						'token': jwToken.issue({id: user.id})
					});
				}
			});
		});
	},

	/*
    |--------------------------------------------------------------------------
    | Insert search to user's seaches
    |--------------------------------------------------------------------------
    | @parameter: - searchKey
    | @required : - searchKey is not empty.
    | @modified : - User model
    | @effect   : - add searchKey to user's searches if doesn't already exist
    | @return   : - 201 with user object if success, 
    |				otherwise 400 if searchKey is empty,
    |				400 if no user found,
    |				202 if searchKey is already existed
    */
	history: function(req, res){
		var search = req.param('searchKey');

		if (!search) return res.json(400, {});

		// convert search to lower case
		search = search.toLowerCase();
		
		// get user's id
		var userId = req.token.id;

		User.findOne(userId, function(err, user){
			if (err) {
				return res.json(500, {err: err});
			}

			if (!user){
				return res.json(400, {err: 'No user found'});
			}

			// searchKey already existed before
			if (user.searches.indexOf(search) != -1){
				return res.json(202, {});
			}

			// push searchKey to searches
			user.searches.push(search);

			User.update(userId, {searches: user.searches})
			.exec(function(err, updated){
				if (err) {
					console.log('User.update ' + err);
					return res.json(500, {err: err});
				}
				
				return res.json(201, {user: user});
			});
		});
	},

	/*
    |--------------------------------------------------------------------------
    | Get weather from forecast.io
    |--------------------------------------------------------------------------
    | @parameter: - lat, lng
    | @required : - lat and lng are complied with latitude and longitude standar
    | @modified : 
    | @effect   : 
    | @return   : - 200 with json weather, otherwise statuscode and error from forecast.io
    */
	skycast: function(req, res){
		var lat = req.param('lat');
		var lng = req.param('lng');
		var latLng = lat + ',' + lng;
		var url = 'https://api.forecast.io/forecast/8e000d8bd0b4c22a097745008c8f9ee9/' + latLng;
		
		request(url, function(error, response, body){
			if (!error && response.statusCode == 200)
				return res.json(200, {skycast: JSON.parse(body)});

			res.json(response.statusCode, {err: JSON.parse(body)});
		});
	}
};

