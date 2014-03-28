/** The first file to be included for the  game to function. */


if (!HexamemEngine){
    HexamemEngine = function(){};
}

function startYourEngines(){
    /** The super object to contain the entire game engine. 
     * 
     * @version 0.1.0-20140327
     * @author Jason J.
     * @type hexamemEnginer|Object
     */
    hexamemEngine = new HexamemEngine();
}

if (window.addEventListener){
    window.addEventListener('load', startYourEngines, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', startYourEngines);
} else {
    window.onload = startYourEngines;
}
