if (typeof HexamemEngine === 'undefined'){
    HexamemEngine = function(){};
}
/**
 * Creates a new game with an empty list.
 * 
 * @param {HexamemEngine.prototype.PlayArea} gameArea The game board area where 
 * the game is played
 * @param {HexamemEngine.prototype.HeaderBoard} scoreBoard The score board where
 * scores and controls are.
 * @param {HexamemEngine.prototype.AudioManager} audioManager The audio manager
 * for loading and playback of sounds.
 * @version 0.4.3-20140413
 * @author Jason J.
 * @type HexamemEngine.prototype.Game
 * @returns {HexamemEngine.prototype.Game}
 * 
 * @requires HexamemEngine.prototype.Storage
 */
HexamemEngine.prototype.Game = function(gameArea, scoreBoard, audioManager){
    /** @type HexamemEngine.prototype.PlayArea The play area that is displayed. */
    var gameboard = gameArea;
    /** @type HexamemEngine.prototype.HeaderBoard The score board area. */
    var scoreboard = scoreBoard;
    /** @type HexamemEngine.prototype.Storage The non-temporal storage for scores. */
    var scorestorage = HexamemEngine.prototype.Storage();
    /** @type HexamemEngine.prototype.AudioManager The audio manager. */
    var audiomanager = audioManager;
    
    /** @type Array|Number The pattern/position list of the current game. */
    var currentGame = new Array();
    /** @type Number The (zero indexed) index of the user's current play.  */
    var currentPlay = 0;
    /** @type Number The game diffculty. Cannot be larger than FLASH_DELAY */
    var currentDifficulty = 0;
    
    /** @type Number The current score. */
    var currentScore = 1;
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
    /** @type Number the number of 'level's before updating the difficulty. */
    var DIFFICULTY_SHIFT_INCREMENT = 2 ;
    
    /** @type String The highscore key for score storage. */
    var KEY_BEST_SCORE = 'my_highscore';
    /** @type String The highscore key for score storage. */
    var KEY_AUTO_PROGRESS_SETTING = 'setting_autoprogress';
    
    var KEY_FLASH_BUTTON_STUB_SOUND = 'flashButton';
    var KEY_ERROR_SOUND = 'errorSound';
    //var KEY_TAP_SOUND = 'tapSound';
    
     /** @type Array|String The audio files and their keys. */
    var AUDIO_FILES = {
        //created with Audacity.
        flashButton1: 'audio/bloop1',
        flashButton2: 'audio/bloop2',
        flashButton3: 'audio/bloop3',
        flashButton4: 'audio/bloop4',
        flashButton5: 'audio/bloop5',
        flashButton6: 'audio/bloop6',
        
        //tapSound: 'audio/none.mp3',
        errorSound: 'audio/buzzer_edit' //source: http://www.soundjay.com/failure-sound-effect.html
    };
    
    
    /** @type Array|Number The flash speed to use. Values are 0 - 3. */
    var FLASH_SPEED = [0,       0,      1,          1,      2,      2];
    /** @type Array|Number A list of delays for between the flashes.*/
    var FLASH_DELAY = [800+300, 800+100, 600+200, 600+100, 400+200, 400+100];
    //first number signifies the flash itself.
    
    /** @type boolean Whether or not to auto progress. Default true. */
    var autoProgress = scoreboard.getAutoProgress();
    
    ///////////////////////////////////////////////////////////////////////////
    //// End Members set.
    ////////////////////////////////////////////////////////////////////////////
    
    ////////////////////////////////////////////////////////////////////////////
    //// Initialize game.
    ////////////////////////////////////////////////////////////////////////////
    
    var setStart = function(){
            gameboard.setMiddleButton('Start', 1);
            gameboard.setMiddleButtonListener(function(){
                gameboard.clearAnimationClasses();
                progress(true);
            }); 
        };
    var startAudio = function(){
        load = function(){
            var keyList = [];
            if (AUDIO_FILES){
                for (var key in AUDIO_FILES){
                    keyList.push(key);
                };
                getFiles = function(){
                    var key = keyList.shift();
                    if (!key){
                        return;
                    }
                    //NOTE: does not work in mobile browsers, only ios homescreen
                    //or desktops
                    /** @TODO progress bar. */
                    audiomanager.addFile(key, AUDIO_FILES[key],
                              function(){},
                              function(){
                                  getFiles();
                              }
                              );                    
                };
                getFiles();
            }
        };
        load();
    };
    
    startAudio();
    setStart();
    
    
    //For closure.
    var that = this;
    
    updateScores();    
    scoreboard.setAutoProgressListener(function(auto){
        autoProgress = auto;
        scorestorage.setRecord(KEY_AUTO_PROGRESS_SETTING, auto);
    });

    if (scorestorage.getRecord(KEY_AUTO_PROGRESS_SETTING) === false || 
            scorestorage.getRecord(KEY_AUTO_PROGRESS_SETTING)){
        autoProgress = scorestorage.getRecord(KEY_AUTO_PROGRESS_SETTING);
        scoreBoard.setAutoProgress(autoProgress);
    };
     
    
    gameboard.enableFlashButtons(false);
    gameboard.setFlashButtonListener(function(pos){
        if (that.testMove(pos)){
            //audio on correct moves.
            audioManager.play(KEY_FLASH_BUTTON_STUB_SOUND+pos);
        }
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
        audioManager.play(KEY_FLASH_BUTTON_STUB_SOUND+currentGame[index]);
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
    /** Checks diffculity and, if necessary, increases it. */
    function checkDifficulty(){
        if (FLASH_DELAY.length !== FLASH_SPEED.length){
            console.log('Unexpected state: Flash diffculty states are inconsistent!');
        }
        if (currentScore > 0 && currentScore % DIFFICULTY_SHIFT_INCREMENT === 0){
            if (currentDifficulty+1 < FLASH_DELAY.length){
                currentDifficulty++;
            }
        }
    }
    
    /** Progresses the game to next level. 
     * @param {boolean} force if true forces the progress. */
    function progress(force){
        gameboard.enableFlashButtons(false);
        if (force){
            checkDifficulty();
            generateNext();
            scoreboard.updateCurrentScore(currentScore+1);
            flashSequence();
        } else if (autoProgress ){
            checkDifficulty();
            generateNext();
            scoreboard.updateCurrentScore(currentScore+1);
            setTimeout(flashSequence, AUTO_PROGRESS_TIME);
        } else {
            gameboard.setMiddleButton('Continue?', 1);
        }
    }
    /** Updates the high score and current score. */
    function updateScores(){
        currentScore = currentGame.length;
        if (bestScore <= 0){
            //update best score from storage.
            var prevScore = scorestorage.getRecord(KEY_BEST_SCORE);            
            if (prevScore){
                bestScore = prevScore;
            }
            scoreboard.updateBestScore(bestScore );
        }
        if (bestScore < currentScore ){
            scoreboard.updateBestScore(bestScore = currentScore );
            scorestorage.setRecord(KEY_BEST_SCORE, bestScore);
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
                progress();
            }, FEEDBACK_DELAY);
        } else {
            var currPlay = currentGame[currentPlay];
            audioManager.play(KEY_ERROR_SOUND);
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
        currentScore = 1;
        currentDifficulty = 0;
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
            }
            return true;
        } else {
            roundFeedback(false);
            this.reset();
            return false;
        }
    };

};