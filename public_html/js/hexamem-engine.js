/** The first file to be included for the  game to function. */

var DEBUG_MODE_ON = false;
if (typeof console === 'undefined'){
    console = {
        log:function(s){
            if (DEBUG_MODE_ON){
                alert(s);
            }
        }
    };
}
/** The super object to contain the entire game engine. 
     * 
     * @version 0.3.0-20140401
     * @author Jason J.
     * @type hexamemEnginer|Object
     */
function HexamemEngine (){
    try {
        var gameboard = new HexamemEngine.prototype.PlayArea(6);
        var scoreboard = new HexamemEngine.prototype.HeaderBoard();
        var game = new HexamemEngine.prototype.Game(gameboard, scoreboard);
    } catch (e){
        console.log('Error: '+e);
    }
};
function startYourEngines(){
    hexamemEngine = new HexamemEngine();
    //Prevent scrolling on ipads
    window.addEventListener('touchmove',function(e) {e.preventDefault();},false);
}

if (window.addEventListener){
    window.addEventListener('load', startYourEngines, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', startYourEngines);
} else {
    window.onload = startYourEngines;
}
