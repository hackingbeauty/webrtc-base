/*
 * spa.model.js
 * Model module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global TAFFY, $, spa */

spa.model = (function () {
  'use strict';
  var
    configMap = { anon_id : 'a0' },
    stateMap  = {
      anon_user             : null,
      cid_serial            : 0,
      is_connected          : false,
      conversation_cid_map  : {},
      people_cid_map        : {},
      conversations_db       : TAFFY(),
      people_db             : TAFFY(),
      user                  : null
    },

    isFakeData = false,

    makeCid,  completeLogin,
    conversationProto, personProto, 
    clearPeopleDb,
    makeConversation, makePerson, chat,
    conversations, people, initModule;

    makeCid = function () {
      return 'c' + String( stateMap.cid_serial++ );
    };

  // The Conversations object API
  // ---------------------
  conversationProto = {
    get_is_conversation : function () {
      return this.cid === stateMap.user.cid;
    },
    get_is_anon : function () {
      return this.cid === stateMap.anon_user.cid;
    }
  };

  makeConversation = function ( conversation_map ) {
    var the_conversation,
      cid     = conversation_map.cid,
      css_map = conversation_map.css_map,
      id      = conversation_map.id,
      name    = conversation_map.name;

    if ( cid === undefined || ! name ) {
      throw 'client id and name required';
    }

    the_conversation         = Object.create( conversationProto );
    the_conversation.cid     = cid;
    the_conversation.name    = name;
    the_conversation.css_map = css_map;

    if ( id ) { the_conversation.id = id; }

    stateMap.conversation_cid_map[ cid ] = the_conversation;
    stateMap.conversations_db.insert( the_conversation );
    return the_conversation;
  };

  conversations = (function () {
    var get_by_cid, get_db, create, join, 
        join_offer, cancel_offer,
        cancel_offer_listen, get_current_user_conversations, 
        get_all, get_latest,
        sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

    get_by_cid = function ( cid ) {
      return stateMap.conversation_cid_map[ cid ];
    };

    get_db = function () { 
      return stateMap.conversations_db; 
    };
    
    get_all = function(callback){
      sio.ajax('/conversations', 'GET',{
        success: function(resp){
          callback(resp.conversations);
        },
        error: function(resp){
          alert('Error in retrieving all conversations', resp);
        }
      });
    };
    
    get_current_user_conversations = function(callback){
      // this route should be restful = /conversations/:id
      sio.ajax('/get_current_user_conversations', 'GET', {
        success: function(resp){
          callback(resp.conversations);
        },
        error: function(resp){
          console.log('Error retrieving current user conversations', resp);
        }
      });
    };

    create = function(data){
      sio.ajax('/conversation/create', 'POST',{
        success: function(resp){
          sio.emit('new conversation', resp);
        },
        error: function(resp){
          alert("You already created that conversation!");
        }
      }, data);
    };

    // Retrieves the most recently created conversation
    get_latest = function(callback){
      sio.on('new conversation broadcast', function(msg) {
        callback(msg[0]);
      });
    };

    join = function(subscriber, conversationID){
      sio.ajax('/conversation/' + conversationID, 'GET', {
        success: function(resp){
          var conversation = {
            creatorID         :  resp.conversationCreatorID,
            subscriberID      :  subscriber.id, 
            conversationName  :  resp.conversationName
          }
          sio.emit('join request', conversation);
          //websocket call with sdp offer sent to conversationCreatorID
        },
        error: function(resp){
          alert('failed to join!');
        }
      });
    };

    join_offer = function(callback){
      sio.on('join request broadcast', function(conversation){
        callback(conversation);
      });
    };

    cancel_offer = function(conversation, callback){
      sio.emit('cancel conversation offer', conversation);

    };

    cancel_offer_listen = function( callback ){
      sio.on('cancel conversation offer broadcast', function(conversation){
        console.log("the conversation is: ", conversation);
        callback(conversation);
      });
    }

    return {
      get_by_cid                      : get_by_cid,
      get_db                          : get_db,
      get_all                         : get_all,
      get_current_user_conversations  : get_current_user_conversations,
      create                          : create,
      get_latest                      : get_latest,
      join                            : join,
      join_offer                      : join_offer,
      cancel_offer                    : cancel_offer,
      cancel_offer_listen             : cancel_offer_listen
    };

  }());


  // The People object API
  // ---------------------
  personProto = {
    get_is_user : function () {
      return this.cid === stateMap.user.cid;
    },
    get_is_anon : function () {
      return this.cid === stateMap.anon_user.cid;
    }
  };

  clearPeopleDb = function () {
    var user = stateMap.user;
    stateMap.people_db      = TAFFY();
    stateMap.people_cid_map = {};
    if ( user ) {
      stateMap.people_db.insert( user );
      stateMap.people_cid_map[ user.cid ] = user;
    }
  };

  completeLogin = function ( user_list ) {
    var user_map = user_list[ 0 ];
    delete stateMap.people_cid_map[ user_map.cid ];
    stateMap.user.cid     = user_map._id;
    stateMap.user.id      = user_map._id;
    stateMap.user.css_map = user_map.css_map;
    stateMap.people_cid_map[ user_map._id ] = stateMap.user;
    $.gevent.publish( 'spa-login', [ stateMap.user ] );
  };

  makePerson = function ( person_map ) {
    var person,
      cid     = person_map.cid,
      css_map = person_map.css_map,
      id      = person_map.id,
      name    = person_map.name;

    if ( cid === undefined || ! name ) {
      throw 'client id and name required';
    }

    person         = Object.create( personProto );
    person.cid     = cid;
    person.name    = name;
    person.css_map = css_map;

    if ( id ) { person.id = id; }

    stateMap.people_cid_map[ cid ] = person;

    stateMap.people_db.insert( person );
    return person;
  };

  people = (function () {
    var get_by_cid, get_db, get_user, login, logout;

    get_by_cid = function ( cid ) {
      return stateMap.people_cid_map[ cid ];
    };

    get_db = function () { return stateMap.people_db; };

    get_user = function () { return stateMap.user; };

    login = function () {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

      sio.ajax('login_status', 'get', 
      {
        success: function(resp){
          stateMap.user = makePerson({
            cid     : makeCid(),
            id      : resp.id,
            css_map : {top : 25, left : 25, 'background-color':'#8f8'},
            name    : resp.name
          });

          sio.on( 'userupdate', completeLogin );

          $.gevent.publish( 'spa-logged-in', [ stateMap.user ] );

          sio.emit( 'adduser', {
            cid     : stateMap.user.cid,
            css_map : stateMap.user.css_map,
            name    : stateMap.user.name
          });
        }
      });
    };

    logout = function () {
      var user = stateMap.user;

      // chat._leave();
      stateMap.user = stateMap.anon_user;
      clearPeopleDb();

      $.gevent.publish( 'spa-logout', [ user ] );
    };

    return {
      get_by_cid : get_by_cid,
      get_db     : get_db,
      get_user   : get_user,
      login      : login,
      logout     : logout
    };
  }());

  chat = (function () {
    var _leave_chat, join_chat;

    _leave_chat = function(){
      alert('leaving the chat!');
    };

    join_chat = function () {
      var sio;
      if ( stateMap.is_connected ) { return false; }
      if ( stateMap.user.get_is_anon() ) {
        console.warn( 'User must be defined before joining chat');
        return false;
      }
      sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
      sio.on( 'listchange', alert('listchange!') );
      stateMap.is_connected = true;
      return true;
    };

    return {
      _leave : _leave_chat,
    };

  }());

  initModule = function () {

    // initialize anonymous person
    stateMap.anon_user = makePerson({
      cid   : configMap.anon_id,
      id    : configMap.anon_id,
      name  : 'anonymous'
    });
    stateMap.user = stateMap.anon_user;
  };
  
  return {
    initModule        : initModule,
    conversations     : conversations,
    people            : people,
    chat              : chat
  };
}());
