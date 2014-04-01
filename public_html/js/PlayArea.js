if (typeof HexamemEngine === 'undefined'){
    HexamemEngine = function(){};
}

/**
 * Responsible for board interactions.
 * Attached to the playing board area. 
 * If board components cannot be found, it throws an Error. 
 * 
 * @param {Number} size The expected size of the play area.
 * @version 0.3.1-20140401
 * @author Jason J.
 * @type HexamemEngine.prototype.PlayArea
 * @returns {HexamemEngine.prototype.PlayArea}
 * @throws {Error} If elements of the play area are not found.
 */
HexamemEngine.prototype.PlayArea = function(size){
    var BOARD_SIZE = size;
    /** @type Number The current flashing speed. Either 0, 1, 2, 3. 0 is slowest. */
    var FLASH_SPEED_INDEX_CLICK = 3;
    
    /** @type Element The underlay background/border of the game board. */
    var gameBorderUnderlay = document.getElementById('game-body-wrapper');
    if (!gameBorderUnderlay){
        throw new Error('Cannot find element with id: "game-body-wrapper"');
    }
    /** @type Element The middle button click area. */
    var middleButtonClickArea = document.getElementById('middle-button-area');    
    /** @type Element The middle button display area. */
    var middleButtonDisplayArea = document.getElementById('middle-button');
    if (!middleButtonClickArea){
        throw new Error('Cannot find element with id: "middle-button-area"');
    }
    if (!middleButtonDisplayArea){
        throw new Error('Cannot find element with id: "middle-button"');
    }
    /** @type string The coords of the middle button to add and remove (and so enable/disable. */
    var middleButtonCoords = middleButtonClickArea.coords;
    middleButtonClickArea.removeAttribute('coords');
    
    /** @type Array|Function The list of functions for the middle button */
    var middleButtonFunctions = new Array();
    
    /** Replace STUB with number to get id. */
    var idClickAreaStub = 'button-area-STUB';
    /** Replace STUB with number to get id. */
    var idButtonDisplayStub = 'button-STUB-wrapper';
    
    /** @type Array|Element An aFLASH_SPEED_INDEX_CLICKrray of elements for the display area. */
    var buttonDisplayArea = new Array();
    /** @type Array|Element An array of elements for the clicking areas. */
    var buttonClickArea = new Array();
    
    
    /** @type Array|Function The list of functions to perform on click. */
    var flashButtonFunctions = new Array();
    
    /** @type Boolean whether or not the flash buttons are enabled. */
    var flashButtonsEnabled = true;
    
    /** @type Array|Number An array of numbers, indicated the position of a 
     * button currently mid-click. */
    var flashButtonInPlay = new Array();
    
    /** @type Array|Number The flash interval between setting the animation and turning it off. */
    var flashInterval = [810, 610, 410, 210];
    /** @type Array|String The flash css for each speed. */
    var flashCssClass = ['flash-normal', 'flash-med-fast', 'flash-fast', 'flash-super-fast'];
    
    ////////////////////////////////////////////////////////////////////////////
    ////  End member initialization
    ////////////////////////////////////////////////////////////////////////////
    //set middle click listener.
    addAction(middleButtonClickArea, middleButtonActions);
    
    for (var index = 1; index <= BOARD_SIZE; index++  ){
        var clickArea = document.getElementById(idClickAreaStub.replace('STUB', index));
        var button = document.getElementById(idButtonDisplayStub.replace('STUB', index));
        
        if (!clickArea && !button){
            throw new Error('Cannot find item '+ index + '\'s clickable or display area.');
        } else if (!button){
            throw new Error('Cannot find item '+ index + '\'s display area.');
        } else if (!clickArea){
            throw new Error('Cannot find item '+ index + '\'s clickable area.');
        }
        buttonDisplayArea.push(button);
        buttonClickArea.push(clickArea);
        addAction(clickArea, (function(index){ //keep closure.
                                return function(){runActions(index);};
                            })(index) );
    }
    
    ////////////////////////////////////////////////////////////////////////////
    //// private functions
    ////////////////////////////////////////////////////////////////////////////
    /** Adds action to element. Could be replaced with jQuery or lib.
     * @param {Element} element 
     * @param {Function} action
     */
    function addAction(element, action){
        var onTouchAction = function(){
            /** Could add useragent check here. 
             * OR we perform a simple cheat:  If touchstart can exist, 
             * it will trigger before the click. Thus we remove the click before the click. */
            //Assume that if touchstart exists, so does removeEventListener.
            element.removeEventListener('click', action);
            //Remove the click action once and reset the touchstart to the action.
            element.removeEventListener('touchstart', onTouchAction);
            element.addEventListener('touchstart', action, false);
            action();
        };
        if (element.addEventListener){
            element.addEventListener('click', action, false);
            element.addEventListener('touchstart', onTouchAction, false);
        } else if (element.attachEvent) {
            element.attachEvent('onclick', action);
        } else {
            element.onclick = action;
            element.ontouchstart= onTouchAction;
        }
    }
    
    /** Adds action to element. Could be replaced with jQuery or lib.
     * @param {Element} element 
     * @param {string} cssClass The class to add or remove.
     * @param {boolean} add (Optional). if true, it adds. If false, removes. Default true.
     */
    function addClass(element, cssClass, add){
        if ('undefined' === add){
            add = true;
        }        
        var currentClass = element.className ? element.className  : '';
        var pattern = new RegExp('(^|\\s)'+cssClass+'(\\s|$)', 'ig');
        var removeClass = function(){
            while (pattern.test(currentClass)){
                element.className = currentClass.replace(pattern, ' ') ;
                currentClass = element.className;
            }
            currentClass = currentClass.replace(/([a-z0-9])\s+$/i, '$1');
        };
        if (add){
            if(pattern.test(currentClass)){
                element.className = currentClass+' '+cssClass;
            } else {
                removeClass();
                element.className = currentClass+' '+cssClass;
            }
        } else {
            removeClass();
        }
    }
    
    /** Safety function used to limit clicks.
     * Sets that a flash button is currently in play or not. 
     * @param {Number} position The button to set/remove from play.
     * @param {boolean} inplay Whether or not the button is play.
     */
    function setFlashButtonInPlay(position, inplay){
        if (inplay){
            flashButtonInPlay.push(position);
        } else {
            for(var index=0; index<flashButtonInPlay.length; index++){
                if (position === flashButtonInPlay[index]){
                    flashButtonInPlay.splice(index, 1);
                }
            }
        }
    }
    /** Safety function used to limit clicks.
     * @param {Number} position The button to check.
     * @return {booelan} <code>true</code> if in play, <code>false</code> otherwise.     */
    function isFlashButtionInPlay(position){
        for(var index=0; index<flashButtonInPlay.length; index++){
            if (position === flashButtonInPlay[index]){
               return true;
            }
        }
        return false;
    }
    /** Runs the list of middle button functions if enabled. */
    function middleButtonActions(){
        for (var index = 0; index < middleButtonFunctions.length; index++){
            middleButtonFunctions[index]();
        }
    }
    
    /**
     * Rans the list of actions for the flash buttons at the position give.
     * @param {number} position The position of the button to run actions.
     */
    function runActions(position){
        if (flashButtonsEnabled){
            if (isFlashButtionInPlay(position)){ 
                //we cannot allow multiple clicks during animation.
                return;
            }
            setFlashButtonInPlay(position,true);
            for(var index = 0, SIZE = flashButtonFunctions.length; index < SIZE; index++){
                flashButtonFunctions[index](position);
            }
            _flashPosition(position, FLASH_SPEED_INDEX_CLICK);
            
            setTimeout(
                function(){
                    setFlashButtonInPlay(position, false);
                },flashInterval[FLASH_SPEED_INDEX_CLICK]+100); //extra buffer time.
        }
    }
    
     /** Flashes the button at the given position using the given css class and interval.  
     * @param {Number} index The 0-index of the button in the buttonDisplayArea array. 
     * @param {string} cssClass The class to add or remove.
     * Invalid values are set to 0.
     * @param {string} cssClass The class to add or remove.
     * @param {Number} flashInterval The time to reset the class after.
     * @throws {Error} If the position is out of bounds. */
    function _setFlashButtonClass(index, cssClass, flashInterval){
        if (index < 0 || index >= buttonDisplayArea.length){
            throw new Error('Out of index bounds!');
        } 
         //add animation class
        addClass(buttonDisplayArea[index], cssClass, true);
        //undo animation class, eventually.
        setTimeout(
                function(){
                    addClass(buttonDisplayArea[index], cssClass, false);
                },flashInterval);
    }
    
    /** Flashes the button at the given position. 
     * @param {Number} position The position of the button in the circle. 
     * @param {Number} speedIndex a value from 0,1,2,3 that denotes speed. 
     * Invalid values are set to 0.
     * @throws {Error} If the position is out of bounds. */
    function _flashPosition(position, speedIndex){
        var index = position -1; //offset by 1.
        speedIndex = (speedIndex < 0 || speedIndex >= flashCssClass.length) ? 0 : speedIndex;
        _setFlashButtonClass(
                index, 
                flashCssClass[speedIndex], 
                flashInterval[speedIndex]);
    }
    
    /** Flashes the button at the given position for a loong burst.
     * @param {Number} position The position of the button in the circle.  */
    function _longFlashPosition(position){
        var LONG_FLASH_CLASS = 'flash-super-slow';
        var LONG_FLASH_INTERVAL= '4800';
        var index = position -1; //offset by 1.
        _setFlashButtonClass(
                index, 
                LONG_FLASH_CLASS, 
                LONG_FLASH_INTERVAL);
    }
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    /** Adds a listener for the middle button.
     * @param {Function} action The function to perform.
     * @throws {Error} If action is not a function.
     */
    this.setMiddleButtonListener = function(action){
        if (typeof action === 'function'){
            middleButtonFunctions.push(action);
        } else {
            throw new Error('"'+action+'" is not a function!');
        }
    };
    /** Adds a listener for the flash buttons.
     * @param {Function} action The function to perform, takes in one parameter:
     * the 1-indexed position of the button pressed.
     * @throws {Error} If action is not a function.
     */
    this.setFlashButtonListener = function(action){
        if (typeof action === 'function'){
            flashButtonFunctions.push(action);
        } else {
            throw new Error('"'+action+'" is not a function!');
        }
    };
    /** Flashes the relevant position
     * @param {Number} position The position to flash. 
     * These go in a clockwise order beginning at 1.
     * @param {Number} speedIndex a value from 0,1,2,3 where larger indices 
     * denote speed.  Invalid values are set to 0. 
     * Speeds are: 800, 600, 400, 200ms, respectively.
     * @throws {Error} If the position is out of bounds. */
    this.flashPosition = function(position, speedIndex){
       _flashPosition(position,speedIndex);
    };    
    
    /** Flashes the button at the given position for a loong burst.
     * @param {Number} position The position of the button in the circle.  */
    this.longFlashPosition = function(position){
        _longFlashPosition(position);
    };
    
    /** @return {Number} The size of the board. */
    this.getSize =  function(){ return BOARD_SIZE; };
    
    /** Enables or disables flash buttons.
     * @param {Boolean} enable if eval'd as <code>true</code>, enables buttons.
     * Othewist false.     */
    this.enableFlashButtons = function(enable){
        flashButtonsEnabled = enable ? true : false;
    };
    
    /** Flashes the game board red + shakes it for negative feedback. */
    this.negativeFeedback = function(){
        var cssClass = 'wrong-background-fade';
        var flashInterval = 4000;
        //add animation class
        addClass(gameBorderUnderlay, cssClass, true);
        //undo animation class, eventually.
        setTimeout(
                function(){
                   addClass(gameBorderUnderlay, cssClass, false);
                },flashInterval);                
    };
    
    /** Flashes the game board green for positive feedback. */
    this.positiveFeedback = function(){
        var cssClass = 'correct-background-fade';
        var flashInterval = 3000;
        //add animation class
        addClass(gameBorderUnderlay, cssClass, true);
        //undo animation class, eventually.
        setTimeout(
                function(){
                    addClass(gameBorderUnderlay, cssClass, false);
                },flashInterval);        
    };
    /**
     * Sets the middle button's inner text and, optionally, mode.
     * @param {String} innerText The text to set in the middle button
     * @param {Number} mode The button mode to set. 
     * 0 for inactive. 1 for active positive. 2 for active negative.
     * Default is 0. Invalid values are assumed 0.
     */
    this.setMiddleButton = function(innerText, mode){
        middleButtonDisplayArea.innerHTML = innerText;
        switch (mode){
            case 1:
                middleButtonDisplayArea.className = 'active';
                middleButtonClickArea.coords = middleButtonCoords;
                break;
            case 2:
                middleButtonDisplayArea.className = 'active bad';
                middleButtonClickArea.coords = middleButtonCoords;
                break;
            case 0:
            default:
             middleButtonDisplayArea.className = 'inactive';
             if (!middleButtonCoords){
                middleButtonCoords = middleButtonClickArea.coords;
             }
             middleButtonClickArea.removeAttribute('coords');
        }
    };
};


