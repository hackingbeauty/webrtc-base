/*
 * crud.js - module to provide CRUD db capabilities
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, unparam : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------

'use strict';

var schema		= require( '../db/schema' ),
  	dbHandle    = require( '../db/db-connector' ).DBConnector,
  	MD5			= require( 'blueimp-md5' );

var Conversation = {
	exists: function ( userID, conversationName, callback) {
		dbHandle.collection('conversations', function(err, collection) {
		    collection.findOne({
		    	conversationName: conversationName
		    }, {safe:true}, function(err, result) {
		        if (err || result === null) {
		        	callback(true);
		        } else {
		        	callback(false);
		        }
		    });
		});
	},
	create: function( userID, conversationName, conversationDesc, userName, callback ){
		var self = this, conversationID = self.generateID(userID, conversationName);
		dbHandle.collection('conversations', function(err, collection) {
		    collection.insert({
		    	userID 					 	: userID,
		    	userName					: userName,
		    	conversationName 		 	: conversationName,
		    	conversationDesccription 	: conversationDesc,
		    	conversationID			 	: conversationID,
		    	creationDate				: new Date().getTime()
		    }, {safe:true}, function(err, result) {
		        if (err) {
		            return false;
		        } 
		        callback(result);
		        return true;
		    });
		});
	},
	find: function( conversationID, callback ){
		dbHandle.collection( 'conversations', function( err, collection ) {
			collection.find({
				conversationID: conversationID
			}, function(err, result){
				if (err) {
					console.log('===== ERROR in Conversation.find()');
					return false;
				}
				result.toArray(function(err, items){
					callback(items);
				});
				return true;
			});
		});
	},
	findUser: function( userID, callback ){
		dbHandle.collection( 'conversations', function( err, collection ) {
			collection.find({
				userID: userID
			}, function(err, result){
				if (err) {
					console.log('===== ERROR in Conversiaton.findUser()');
					return false;
				}
				result.sort( { 'creationDate' : -1 } ).toArray(function(err, items){
					callback(items);
				});
				return true;
			});
		});
	},
	all: function(callback){
		var self = this;
		dbHandle.collection( 'conversations', function( err, collection ) {
			collection.find(
				function(err, result){
					var returnObj = [], i ;
					if (err) {
						console.log('===== ERROR in Converstion.all()');
						return false;
					}
					result.sort( {'creationDate': -1 } ).toArray(function(err, items){
						for(i = 0; i < items.length; i++){
							returnObj.push({
								'userID': items[i].userID,
								'userName': items[i].userName,
								'conversationID':   items[i].conversationID,
								'conversationName': items[i].conversationName,
								'conversationDescription': items[i].conversationDescription,
								'creationDate': self.timeAgo(items[i].creationDate)
							});
						}
						callback(returnObj);
					});
					return true;
				}
			);
		});
	},
	generateID: function(userID, conversationName){
		var str = userID + conversationName + new Date().getTime();
		return MD5.md5(str);
	},
	timeAgo: function(timestamp){
		var timeDiff, lapsedTime;
		timeDiff = new Date() - new Date(timestamp);
		if( new Date(timeDiff).getUTCHours() > 0 ){
			lapsedTime = new Date(timeDiff).getUTCHours() + " hours ago";
		} else if( new Date(timeDiff).getUTCHours() === 0 && 
				   new Date(timeDiff).getUTCMinutes() > 1){
			lapsedTime = new Date(timeDiff).getUTCMinutes()  + " minutes ago";
		} else {
			lapsedTime = new Date(timeDiff).getUTCSeconds() + " seconds ago";
		}

		return lapsedTime;
	}
};

module.exports = { Conversation : Conversation };





