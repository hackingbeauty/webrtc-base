/*
 * module_template.js
 * Template for browser feature modules
 *
 * Michael S. Mikowski - mike.mikowski@gmail.com
 * Copyright (c) 2011-2012 Manning Publications Co.
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, spa, Handlebars */

spa.sidebar = (function () {

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html         : Handlebars.compile($('#spa-sidebar-list-module').html()),
      sidebar_list_html : Handlebars.compile($('#spa-sidebar-list-item-module').html()),
      settable_map      : { color_name: true },
      color_name        : 'blue'
    },
    stateMap  = { $container : null },
    jqueryMap = { },
    onCurrentUserConversations, onLatestCreatedConversation,
    setJqueryMap, configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = { 
      $container                : $container, 
      $window                   : $(window),
      $currUserConversationList : $container.find('#spa-current-user-conversation-list')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  // Executes 
  onCurrentUserConversations = function( currUserConversations ){
    jqueryMap.$currUserConversationList.append( configMap.main_html({
      currUserConversations: currUserConversations
    }));
  };

  // Executes when user creates a new conversation
  onLatestCreatedConversation = function( data ){
    var user = spa.model.people.get_user(),
        userID = data.userID;
    //if id of currently logged in user is same as id of person who created recent conversation
    if( user.id === userID){ 
      jqueryMap.$currUserConversationList.prepend( configMap.sidebar_list_html({
        conversation: data
      }));
    }
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
    $container.append( configMap.main_html );
    setJqueryMap();

    // get all the current user's conversations
    spa.model.conversations.get_current_user_conversations( onCurrentUserConversations );

    // update sidebar when a conversation gets created by someone
    spa.model.conversations.get_latest( onLatestCreatedConversation ); 
    
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
