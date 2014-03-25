/*
 * spa.call_modal_template.js
 * Template for call modal
 *
 * Mark M. Muskardin - mark.muskardin@gmail.com
 * Copyright (c) 2014 hackingbeauty.com
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, spa */

spa.call_modal = (function () {

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      settable_map        : { color_name: true },
      color_name          : 'blue',
      call_modal_html     : Handlebars.compile($('#spa-call-modal-module').html()),
    },
    stateMap  = { $container : null },
    jqueryMap = {},
    setJqueryMap, configModule, offerModal, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // example : getTrimmedString
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = { 
      $container    : $container, 
      $callModal    : $container.find( '#spa-call-modal' ),
      $modalHeader  : $container.find( '.modal-header' )
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  offerModal = function (conversation) {
    var user = spa.model.people.get_user(),
        conversation = conversation[0];

    spa.sound.playSound('ring');
    
    jqueryMap.$callModal.modal({ //launch creator modal
      'keyboard':true,
      'hide.bs.modal':function(e){
        alert('i am closed!');
      }
    });

    jqueryMap.$callModal.on('hidden.bs.modal', function () {
      spa.model.conversations.cancel_offer(conversation,cancelOffer);
    });

    if(user.id == conversation.creatorID){
      jqueryMap.$modalHeader.html(conversation.conversationName);
    } else if(user.id == conversation.subscriberID) {
      jqueryMap.$modalHeader.html("Waiting: " + conversation.conversationName);
    }
  };

  cancelOffer = function(conversation) {
    var user = spa.model.people.get_user(),
        conversation = conversation[0];
    spa.sound.stopSound('ring');
    if(user.id == conversation.creatorID || user.id == conversation.subscriberID){
      jqueryMap.$callModal.modal('hide');
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
    $container.append( configMap.call_modal_html() );
    setJqueryMap();
    spa.model.conversations.join_offer(offerModal);
    spa.model.conversations.cancel_offer_listen(cancelOffer);
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