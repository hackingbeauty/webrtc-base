/*
 * routes.js - module to provide routing
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

'use strict';

var authentication = function(){

  var 
    mode = process.env.NODE_ENV,
    appID, 
    appSecret,
    hostName,
    dbPath,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongooseAuth = require('mongoose-auth'),
    UserSchema = new Schema({}), 
    User;

  if(mode === 'production'){
    appID = 'facebook_production_app_id';
    appSecret = 'facebook_production_app_secret';
    hostName = 'http://chat-salon.nodejitsu.com';
    dbPath = 'mongodb://nodejitsu_production_path';
  } else if(mode === 'development'){
    appID = 'facebook_development_app_id';
    appSecret = 'facebook_development_app_secret';
    hostName = 'http://localhost:3000';
    dbPath = 'mongodb://nodejitsu_development_path';
  }

  UserSchema.plugin(mongooseAuth, {
    facebook: true
  });

  // STEP 1: Schema Decoration and Configuration for the Routing
  UserSchema.plugin(mongooseAuth, {
      // Here, we attach your User model to every module
      everymodule: {
        everyauth: {
            User: function () {
              return User;
            }
        }
      }
    , facebook: {
        everyauth: {
            myHostname: hostName
          , appId: appID
          , appSecret: appSecret
          , redirectPath: '/'
        }
      }
  });

  mongoose.model('User', UserSchema);

  mongoose.connect(dbPath);

  User = mongoose.model('User');
};

module.exports = {authenticate: authentication};