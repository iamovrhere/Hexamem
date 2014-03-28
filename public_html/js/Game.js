if (!HexamemEngine){
    HexamemEngine = function(){};
}
/**
 * Creates a new game with an empty game.
 * @version 0.1.0-20140326
 * @author Jason J.
 * @type Game
 * @returns {Game}
 */
HexamemEngine.prototype.Game = function(){

    /** @type Array|Number the pattern list of the current game. */
    var currentGame = new Array();
    /** @type Number The index of the user's current play.  */
    var currentPlay = 0;
    /** @type The current board size. */
    var boardSize = 0;
    
    /** @type Number The limit on how many times a number can be repeated in row. */
    var REPEAT_LIMIT = 4;
    /** @type Number The auto progress time. */
    var AUTO_PROGRESS_TIME = 1750;
    
    /** @type boolean Whether or not to auto progress. Default true. */
    var autoProgress = true;    
    
    ////////////////////////////////////////////////////////////////////////////
    //// interal functions
    ////////////////////////////////////////////////////////////////////////////
    /** Tests choice to see if valid. 
     * @param {Number} choice The choice of the user 
     * @return {Boolean} <code>true</code> for valid, <code>false</code> otherwise.*/
    var testChoice = function(choice){
        if(currentPlay >= currentGame.length) {
            return false;
        }
        //returns if the choice matched the move and increments to the next play.
        return choice === currentGame[currentPlay++];
    };
    
    /** @return {Number} Randomly regenerated number from 1 - boardSize */
    function regen(){ return (Math.random() % boardSize) + 1; }
    
    /** Generates the next game move. 
     * Ensuring there are no more than 'repeatLimit' repeats. */
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
    
    function flashSequence(){
        
    }
    
    function progress(){
        generateNext();
        if (autoProgress){
            setTimeout(flashSequence, AUTO_PROGRESS_TIME);
        } else {
            /** @TODO continue button. */
        }
    }
    
    function roundFeedback(good){
       
    };
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    this.reset = function(){
        currentGame = new Array();        
        currentPlay = 0;
    };
    
    this.start = function(){
        generateNext();        
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