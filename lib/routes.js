/*
 * routes.js - module to provide routing
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, unparam : true,
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';

var
  configRoutes,
  Conversation  = require( '../model/conversation' ).Conversation;

// ------------- END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN PUBLIC METHODS ------------------
configRoutes = function ( app ) {
  
  app.get( '/', function ( request, response ) {
    if(request.user){
      response.render('index');
    } else {
      response.render('login', { title: 'Chat Salon' });
    }
  });

  app.get('/conversations', function( request, response ){
    response.contentType( 'json' );
    Conversation.all(function(conversations){      
      response.send( {
        conversations: conversations
      });
    });
  });

  // getting the currently logged in user's conversations
  // this route should be restful = /conversations/:id
  app.get('/get_current_user_conversations', function( request, response ){
    var userID = request.user.fb.id;
    response.contentType( 'json' );
    if(request.user){
      Conversation.findUser(userID, function(conversations){
        response.send( {
          conversations: conversations
        });
      });
    }
  });

  app.post('/conversation/create', function( request, response ){
    var conversationName        = request.body.convo_title,
        conversationDescription = request.body.convo_desc,
        userID                  = request.user.fb.id,
        userName                = request.user.fb.name.full;
    response.contentType( 'json' );
    if(request.user){
      Conversation.exists(userID, conversationName, function(noRecordFound){
        if(noRecordFound){
          Conversation.create(userID, conversationName, conversationDescription, userName, 
            function(conversation){
              response.statusCode = 200;
              response.send( { 
                msg               : "Successfully created!",
                conversationName  : conversation[0].conversationName,
                conversationID    : conversation[0].conversationID,
                userName          : conversation[0].userName,
                userID            : conversation[0].userID,
                timeAgo           : Conversation.timeAgo(conversation[0].creationDate)
              }
            );
          });
        } else {
          response.statusCode = 409; //http "conflict" status code
          response.send( { msg: "Sorry, but we couldn't create your conversation." } );
        }
      });
    }
  });

  app.get('/conversation/:id', function( request, response ){
    var conversationID = request.params.id;
    response.contentType( 'json' );
    Conversation.find(conversationID, function(conversation){
      response.statusCode = 200;
      console.log('ok da conversation data is: ', conversation);
      response.send({
        conversationName        : conversation[0].conversationName,
        conversationCreatorID   : conversation[0].userID
      });
    });
  })

  app.get('/login_status', function(request, response){
    var user = {
      name        : request.user.fb.name.full,
      loginStatus : request.loggedIn,
      id          : request.user.fb.id
    };
    response.contentType( 'json' );
    response.send( user );
  });

  app.get('/login', function( request, response ){
    response.render('login', { title: 'Chat Salon' });
  });

  app.get('/logout', function( request, response){
    request.logout();
  });

};

module.exports = { configRoutes : configRoutes };
// ----------------- END PUBLIC METHODS -------------------
