/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

 var bcrypt = require('bcrypt');

module.exports = {

	schema: true,

  	attributes: {

  		username:{
  			type: 'string',
  			required: true,
  			unique: true
  		},

  		encryptedPassword:{
  			type: 'string'
  		},

  		searches: {
  			type: 'array',
  			defaultsTo: []
  		},

      /*
      |--------------------------------------------------------------------------
      | Modifies return object
      |--------------------------------------------------------------------------
      | @parameter: 
      | @required : 
      | @modified : 
      | @effect   : 
      | @return   : user boject without password field
      */
  		toJSON: function(){
  			var obj = this.toObject();
  			delete obj.encryptedPassword;
  			return obj;
  		},	
  	},

    /*
    |--------------------------------------------------------------------------
    | Engrypt password before create user
    |--------------------------------------------------------------------------
    | @parameter: password
    | @required : password is not empty
    | @modified : encryptedPassword
    | @effect   : encrypt password and assign to encryptedPassword
    | @return   : 
    */
  	beforeCreate: function(values, next){
  		bcrypt.genSalt(10, function(err, salt){
  			if (err) next(err);

  			bcrypt.hash(values.password, salt, function(err, hash){
  				if (err) {
            console.log(err);
            return next(err);
          }

  				values.encryptedPassword = hash;
  				next();
  			});
  		});
  	},

    /*
    |--------------------------------------------------------------------------
    | Compare password
    |--------------------------------------------------------------------------
    | @parameter: - password, user, callback
    | @required : - password, user, and cb are not empty
    |             - cb is a function
    | @modified : 
    | @effect   : call cb with null and true if success otherwise with err onlu
    | @return   : 
    */
  	comparePassword: function(password, user, cb){
  		bcrypt.compare(password, user.encryptedPassword, function(err, match){
  			if (err) cb(err);

  			if (match){
  				cb(null, true);
  			}else{
  				cb(err);
  			}
  		});
  	}
};

