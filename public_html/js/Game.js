if (typeof HexamemEngine === 'undefined'){
    HexamemEngine = function(){};
}
/**
 * Creates a new game with an empty list.
 * 
 * @param {HexamemEngine.prototype.PlayArea} gameArea The game board area where 
 * the game is played
 * * @param {HexamemEngine.prototype.HeaderBoard} scoreBoard The score board where
 * scores and controls are.
 * @version 0.2.0-20140401
 * @author Jason J.
 * @type HexamemEngine.prototype.Game
 * @returns {HexamemEngine.prototype.Game}
 */
HexamemEngine.prototype.Game = function(gameArea, scoreBoard){
    /** @type HexamemEngine.prototype.PlayArea The play area that is displayed. */
    var gameboard = gameArea;
    /** @type HexamemEngine.prototype.HeaderBoard The score board area. */
    var scoreboard = scoreBoard;
    
    /** @type Array|Number The pattern/position list of the current game. */
    var currentGame = new Array();
    /** @type Number The (zero indexed) index of the user's current play.  */
    var currentPlay = 0;
    /** @type Number The game diffculty. Cannot be larger than FLASH_DELAY */
    var currentDifficulty = 0;
    
    /** @type Number The current score. */
    var currentScore = 0;
    /** @type Number The best score. */
    var bestScore = 0;
    
    /** @type The current board size. */
    var boardSize = gameArea.getSize();
    
    /** @type Number The limit on how many times a number can be repeated in row. */
    var REPEAT_LIMIT = 3;
    /** @type Number The auto progress time. */
    var AUTO_PROGRESS_TIME = 3550;
    /** @type Number the delay before providing feedback. */
    var FEEDBACK_DELAY = 1000;
    
    /** @TODO game difficulty slope. */
    /** @TODO local storage of best scores. */
    
    /** @type Array|Number The flash speed to use. Values are 0 - 3. */
    var FLASH_SPEED = [0,       0,      1,          1,      2,      2];
    /** @type Array|Number A list of delays for between the flashes.*/
    var FLASH_DELAY = [800+300, 800+100, 600+200, 600+100, 400+200, 400+100];
    //first number signifies the flash itself.
    
    /** @type boolean Whether or not to auto progress. Default true. */
    var autoProgress = scoreboard.getAutoProgress();    
    
    ////////////////////////////////////////////////////////////////////////////
    //// End Members set.
    ////////////////////////////////////////////////////////////////////////////
    updateScores();
    scoreboard.setAutoProgressListener(function(auto){
        autoProgress = auto;
    });
    
    gameboard.setMiddleButton('Start', 1);
    gameboard.setMiddleButtonListener(function(){
        progress(true);
    });
    var that = this;
    gameboard.setFlashButtonListener(function(pos){
        that.testMove(pos);
    });
    
    scoreboard.setResetListener(function(){
        gameboard.setMiddleButton('Start', 1);
        that.reset();
    });
    
    ////////////////////////////////////////////////////////////////////////////
    //// interal functions
    ////////////////////////////////////////////////////////////////////////////
    /** Tests choice to see if valid.  Do not call directly.
     * @param {Number} choice The choice of the user 
     * @return {Boolean} <code>true</code> for valid, <code>false</code> otherwise.*/
    var testChoice = function(choice){
        if(currentPlay >= currentGame.length) {
            return false;
        }
        //returns if the choice matched the move and increments to the next play.
        if (choice === currentGame[currentPlay]){
            currentPlay++; //only increment if we are good to go.
            return true;
        }
        return false;
    };
    
    /** @return {Number} Randomly regenerated number from 1 - boardSize */
    function regen(){ return (Math.floor(Math.random() * boardSize + 1)); }
    
    /** Generates the next game move in the squence and adds it.
     * Ensuring there are no more than 'REPEAT_LIMIT' repeatitions. */
    function generateNext(){        
        var nextMove = regen();
        var LIMIT = currentGame.length - REPEAT_LIMIT;
        //If negative, we cannot have enough repeats. 
        if (LIMIT < 0){
            for (var index = currentGame.length-1; index >= 0; index++ ){
                //if our values differ, then we have insuffcient repeats.
                if (currentGame[index] !== currentGame[index-1]){
                    break;
                }
                //if we have reached the limit.
                if (LIMIT === index){
                    //While the current game value == our next move.
                    while(nextMove === currentGame[index]){
                        nextMove = regen();
                    }
                    break;
                }
            }
        }
        currentGame.push(nextMove);
    }    
    
    /**<b>Deprecated</b>
     * Flashes the button at the give position with appropriate difficulty. 
     * @param {Number} position the button to flash. 
     * @param {Number} delay The delay before the */
    function flash(position, delay){
        console.log('flash:'+position)
        setTimeout(
                function(){
                    gameboard.flashPosition(position, FLASH_SPEED[currentDifficulty]);
            }, delay);
    }
    
    /** Flashes the current sequence recursively.
     * @param {Number} index (Optional) The index of the game to flash. Default is 0.*/
    function flashSequence(index){
        if (typeof index !== 'number'){
            index = 0;
        }
        if (0 === index){//disable buttons on first round.
            gameboard.enableFlashButtons(false);
            gameboard.setMiddleButton('', 0);
        }
        console.log('seq: %s --> %s', index, currentGame[index])
        gameboard.flashPosition(currentGame[index], FLASH_SPEED[currentDifficulty]);
        index++;        
        if (currentGame.length === index){
            //we are done.
            gameboard.enableFlashButtons(true);
        } else {
             setTimeout(
                        function(){flashSequence(index);},
                        FLASH_DELAY[currentDifficulty]);
        }
    }
    
    /** Progresses the game to next level. 
     * @param {boolean} force if true forces the progress. */
    function progress(force){
        console.log('progreess')
        gameboard.enableFlashButtons(false);
        generateNext();
        if (force){
            flashSequence();
        } else if (autoProgress ){
            setTimeout(flashSequence, AUTO_PROGRESS_TIME);
        } else {
            gameboard.setMiddleButton('Continue?', 1);
        }
    }
    /** Updates the high score and current score. */
    function updateScores(){
        currentScore = currentGame.length;
        if (bestScore < currentScore){
            scoreboard.updateBestScore(bestScore = currentScore);
        }
        scoreboard.updateCurrentScore(currentScore);
    }
    /** Provides the user with feedback for this round. *
     * @param {Boolean} good true if good, false if bad.
     */
    function roundFeedback(good){
        gameboard.enableFlashButtons(false);
        if (good){
            setTimeout(function(){
                gameboard.positiveFeedback();
                updateScores();
            }, FEEDBACK_DELAY);
        } else {
            var currPlay = currentGame[currentPlay];
            //gameboard.positiveFeedback();
            gameboard.negativeFeedback();
            gameboard.setMiddleButton('Retry?', 2);
            //show correct move.
            gameboard.longFlashPosition(currPlay);            
        }
    };
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    this.reset = function(){
        currentGame = new Array();        
        currentPlay = 0;
        currentScore = 0;
        updateScores();
    };
    
    this.start = function(){
        this.reset();
        progress(true);
    };
    
    this.setAutoProgress = function(autoprogress){
        autoProgress = autoprogress;
    };
    
    this.testMove = function(move){
        //if move valid.
        if (testChoice(move)){
            //if last move for this round.
            if (currentPlay >= currentGame.length){
                currentPlay = 0;
                roundFeedback(true);
                progress();
            }
            return true;
        } else {
            roundFeedback(false);
            this.reset();
            return false;
        }
    };

};