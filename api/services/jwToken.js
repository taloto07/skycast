/**
 * jwToken
 *
 * @description :: Server-side logic for managing token
 */

var jwt = require('jsonwebtoken');
	tokenSecret = 'reallyreallysecret';

// Generates a token from supplied payload
module.exports.issue = function(payload){
	/*
    |--------------------------------------------------------------------------
    | Generate toke
    |--------------------------------------------------------------------------
    | @parameter: - payload
    | @required : - username is not empty
    | @modified : 
    | @effect   : 
    | @return   : - token expire in 30 days
    */
	return jwt.sign(
		payload,
		tokenSecret,
		{
			expiresIn: '30d'	// seconds
		}
	);
};

/*
|--------------------------------------------------------------------------
| Verifies a token on request
|--------------------------------------------------------------------------
| @parameter: - token, callback
| @required : - token and callback are not empty
| @modified : 
| @effect   : 
| @return   :
*/
module.exports.verify = function(token, callback){
	return jwt.verify(
		token,
		tokenSecret,
		{},
		callback
	);
};