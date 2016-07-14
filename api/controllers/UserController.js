/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('request');

module.exports = {
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

	history: function(req, res){
		var search = req.param('searchKey');

		if (!search) return;

		search = search.toLowerCase();
		console.log(search);
		// get user's id
		var userId = req.token.id;

		User.findOne(userId, function(err, user){
			if (err) {
				console.log('User.findOne ' + err);
				return res.json(500, {err: err});
			}

			// searchKey already existed before
			if (user.searches.indexOf(search) != -1){
				console.log('indexOf');
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

	skycast: function(req, res){
		var lat = req.param('lat');
		var lng = req.param('lng');
		var latLng = lat + ',' + lng;
		var url = 'https://api.forecast.io/forecast/8e000d8bd0b4c22a097745008c8f9ee9/' + latLng;
		console.log(lat);
		console.log(lng);
		request(url, function(error, response, body){
			// console.log(error);
			// console.log(response);
			// console.log(body);
			
			if (!error && response.statusCode == 200)
				return res.json(200, {skycast: JSON.parse(body)});

			res.json(response.statusCode, {err: JSON.parse(body)});
		});
	}
};

