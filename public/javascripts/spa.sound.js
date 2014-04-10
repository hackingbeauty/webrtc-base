/*
 * spa.shell.js
 * Shell module for SPA
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, unparam : true
*/
/*global $, spa, Handlebars */

spa.sound = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    clickSound = document.createElement('audio'), 
    playSound, stopSound, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  playSound = function(type){
    switch(type){
      case 'ring':
        clickSound.setAttribute('src', '/sounds/phone_ring.mp3');
        clickSound.loop = true;
        break;
      case 'zap':
        clickSound.setAttribute('src', '/sounds/zap-sound.mp3');
        clickSound.loop = false;
        break;
      case 'click':
        clickSound.setAttribute('src', '/sounds/single_click_trimmed.mp3');
        clickSound.loop = false;
        break;
    }
    clickSound.play();
  };

  stopSound = function(type){
    clickSound.pause();
    clickSound.currentTime = 0;
  };

  initModule = function ( ) {
    clickSound.setAttribute('src','/sounds/single_click_trimmed.mp3');
    clickSound.setAttribute('autoplay', 'autoplay'); //putting this here for now, otherwise issues :)
  };
  // End PUBLIC method /initModule/

  return { 
    initModule  : initModule, 
    playSound   : playSound,
    stopSound   : stopSound
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
