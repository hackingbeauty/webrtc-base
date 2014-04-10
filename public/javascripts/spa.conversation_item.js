/*
 * spa.conversation.js
 * Chat feature module for SPA
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, unparam : true
*/

/*global $, spa, Handlebars, io */

spa.conversation_items = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      conversation_item_html : Handlebars.compile($('#spa-conversation-item-module').html()),
      settable_map : { color_name: true },
      color_name   : 'blue'
    },
    stateMap  = { $container : null },
    jqueryMap = {},
    setJqueryMap, configModule, initModule, conversationRequests,
    onConversationCreated, onAllConversations;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container  = stateMap.$container;
        
    jqueryMap = { 
      $container        : $container,
      $conversationList : $container.find( '#spa-conversation-list' )
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  // Event Handler for requests to join conversation
  conversationRequests = function(){
    jqueryMap.$conversationList.on('click','.join_conversation', function(evt){
      var conversationID = $(this).attr('href');
      spa.model.conversations.join(spa.model.people.get_user(),conversationID);
      evt.preventDefault();
    });
  };

  onAllConversations = function(data){
    var user = spa.model.people.get_user(),
        userID = data.userID;

    for(var i = 0; i<data.length;i++){
      if(data[i].userID == user.id){
        jqueryMap.$conversationList.append(configMap.conversation_item_html(
          { conversation : data[i], currentUserCreated: true }
        ));
      } else {
        jqueryMap.$conversationList.append(configMap.conversation_item_html(
          { conversation : data[i], currentUserCreated: false }
        ));
      }
    }
  };

  onConversationCreated = function(data){
    var user = spa.model.people.get_user(),
        userID = data.userID;
    //if id of currently logged in user is same as id of person who created recent conversation
    if( user.id === userID){ 
      jqueryMap.$conversationList.prepend(configMap.conversation_item_html(
        { conversation: data, currentUserCreated: true }
      ));
    } else {
      jqueryMap.$conversationList.prepend(configMap.conversation_item_html(
        { conversation: data, currentUserCreated: false }
      ));
    }
    spa.sound.playSound('zap');
  };
  //-------------------- END EVENT HANDLERS --------------------


  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /configModule/
  // Purpose    : Adjust configuration of allowed keys
  // Arguments  : A map of settable keys and values
  //   * color_name - color to use
  // Settings   :
  //   * configMap.settable_map declares allowed keys
  // Returns    : true
  // Throws     : none
  //
  configModule = function ( input_map ) {
    spa.butil.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };
  // End public method /configModule/

  // Begin public method /initModule/
  // Purpose    : Initializes module
  // Arguments  :
  //  * $container the jquery element used by this feature
  // Returns    : true
  // Throws     : none
  //


  initModule = function ( $container ) {
    stateMap.$container = $container;
    setJqueryMap();
    
    // get the most recent conversations
    $.gevent.subscribe( jqueryMap.$container, 'spa-logged-in', spa.model.conversations.get_all( onAllConversations ));

    // update list when a conversation gets created by someone
    spa.model.conversations.get_latest( onConversationCreated );

    conversationRequests();
    
    return true;
  };
  // End public method /initModule/

  // return public methods
  return {
    configModule : configModule,
    initModule   : initModule
  };
  //------------------- END PUBLIC METHODS ---------------------
}());