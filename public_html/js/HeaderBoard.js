if (typeof HexamemEngine === 'undefined'){
    HexamemEngine = function(){};
}

/**
 * Responsible for score board interactions.
 * 
 * @version 0.2.0-20140411
 * @author Jason J.
 * @type HexamemEngine.prototype.HeaderBoard
 * @returns {HexamemEngine.prototype.HeaderBoard}
 * @throws {Error} If elements of the score board are not found.
 */
HexamemEngine.prototype.HeaderBoard = function(){
    /** @type element The best score span. */
    var bestScore = document.getElementById('best-score');    
    /** @type Element The current score. */
    var currentScore = document.getElementById('current-score');
    if (!bestScore){
        throw new Error('Cannot find element with id: "best-score"');
    }
    if (!currentScore){
        throw new Error('Cannot find element with id: "current-score"');
    }
    /** @type Element|Input|Checkbox The auto-progress check box. */
    var autoProgressCheck = document.getElementById('auto-progress');    
    /** @type Element|Input The reset button. */
    var resetButton = document.getElementById('reset-button');
    if (!autoProgressCheck){
        throw new Error('Cannot find element with id: "auto-progress"');
    }
    if (!resetButton){
        throw new Error('Cannot find element with id: "reset-button"');
    }
    /** @param {String} score the score to set it to. */
    this.updateBestScore = function(score){
        bestScore.innerHTML = score;
    };
    /** @param {String} score the score to set it to. */
    this.updateCurrentScore = function(score){
        currentScore.innerHTML = score;
    };
    /** @return {Boolean} true if checked, false otherwise. */
    this.getAutoProgress = function(){
        return autoProgressCheck.checked ? true : false;
    };
    /** @param {Function} action The function to set the reset button to. */
    this.setResetListener = function(action){
        var element = resetButton;
        if (typeof action !== 'function'){
            throw new Error('Not a function!');
        }
        if (element.addEventListener){
            element.addEventListener('click', action, false);
        } else if (element.attachEvent) {
            element.attachEvent('onclick', action);
        } else {
            element.onclick = action;
        }
    };
    /** @param {boolean} enabled true to check, false to uncheck. */
    this.setAutoProgress = function(enabled){
        autoProgressCheck.checked = enabled ? 'checked' : '';
    };
    /** @param {Function} action The function to perform with the progress checkbox
     * is clicked. Sends the value of the checkbox as a param. */
    this.setAutoProgressListener = function(action){
        var element = autoProgressCheck;
        if (typeof action !== 'function'){
            throw new Error('Not a function!');
        }
        var _action = function(){
            action(autoProgressCheck.checked);
        };
        if (element.addEventListener){
            element.addEventListener('click', _action, false);
        } else if (element.attachEvent) {
            element.attachEvent('onclick', _action);
        } else {
            element.onclick = _action;
        }
    };
    
};