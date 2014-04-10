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
      $container          : $container, 
      $callModal          : $container.find( '#spa-call-modal' ),
      $modalHeader        : $container.find( '.modal-header' ),
      $modalBodyCaller    : $container.find( '.modal-body #caller' ),
      $modalBodyCallee    : $container.find( '.modal-body #callee'),
      $modalFooterCaller  : $container.find( '.modal-footer #caller-actions '),
      $modalFooterCallee  : $container.find( '.modal-footer #callee-actions ')
    };
  };
  // End DOM method /setJqueryMap/
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  offerModal = function (conversation) {
    var user = spa.model.people.get_user(),
        conversation = conversation[0];

    spa.sound.playSound('ring');
    
    if(user.id === conversation.creatorID || user.id === conversation.subscriberID){
      jqueryMap.$callModal.modal({ //launch creator modal
        'keyboard':true
      });

      jqueryMap.$callModal.on('hidden.bs.modal', function () {
        spa.model.conversations.cancel_offer(conversation,cancelOffer);
      });
    }

    if(user.id == conversation.creatorID){ //if callee
      jqueryMap.$modalHeader.html("Someone wants to discuss: " + conversation.conversationName);
      jqueryMap.$modalFooterCallee.removeClass('hide');
    } else if(user.id == conversation.subscriberID) { //if caller
      jqueryMap.$modalHeader.html("Let's discuss: " + conversation.conversationName);
      jqueryMap.$modalFooterCaller.removeClass('hide');
    }

    jqueryMap.$modalBodyCaller.html("<img src='https://graph.facebook.com/"+conversation.subscriberID+"/picture?type=large' width='100' height='100' />");
    jqueryMap.$modalBodyCallee.html("<img src='https://graph.facebook.com/"+conversation.creatorID+"/picture?type=large' width='100' height='100' />");
  
    $('#accept-call').on('click', function(){
      spa.model.conversations.send_accept_notification(conversation);
    });
  };

  cancelOffer = function(conversation) {
    var user = spa.model.people.get_user(),
        conversation = conversation[0];

    spa.sound.stopSound('ring');
    if(user.id == conversation.creatorID || user.id == conversation.subscriberID){
      jqueryMap.$callModal.modal('hide');
      jqueryMap.$modalFooterCallee.addClass('hide');
      jqueryMap.$modalFooterCaller.addClass('hide');
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
    spa.model.conversations.listen_for_join_offer(offerModal);
    spa.model.conversations.listen_for_cancel_offer(cancelOffer);
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