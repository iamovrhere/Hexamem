if (typeof HexamemEngine === 'undefined'){
    HexamemEngine = function(){};
}
/**
 * Retrieves a new audio manager for storing and playback of audio files.
 * Supports .mp3 & .ogg .
 * 
 * @version 0.1.0-20140411
 * @author Jason J.
 * @type HexamemEngine.prototype.AudioManager
 * @returns {HexamemEngine.prototype.AudioManager}
 */
HexamemEngine.prototype.AudioManager = function(){
    /** @type Object|Audio A list of object files names. */
    var fileList = {};
    /** @type Object|String lists supported audio types and their MIME types. */
    var supportedFormats = {
        ogg: 'audio/ogg; codecs="vorbis"',
        mp3: 'audio/mpeg',
        wav: 'audio/wav'
    };
    
    
    var testA = new Audio();
    /** 
     * @param {string} type The key to the list 'supportedFormats' to test.
     * @return {boolean} true if supported, false otherwise. */
    function isSupportedAudioType(type){
        if (!testA) return false;
        //return bool and only bool.
        return !!(testA.canPlayType && testA.canPlayType(supportedFormats[type]).replace(/no/, ''));
    }
    /** @param {Element|Audio} a the element to stop. */
    function stopAudio(a){
        if (a.pause){
            a.pause();            
        }
    };
    
    /** @param {Element|Audio} a the element to play. */
    function playAudio(a){
        if (a.play){       
            try{
                a.currentTime = 0;
            } catch (e){}
            a.play();
        }
    };
    
    
    /** Adds file to the file list.
     * @param {String} key The key to store it under (must be unique).
     * @param {String} filename The filename/location. If the file extension is 
     * omitted, "ogg" and "mp3" will be tried for different browsers. 
     * Assumes similiar, lowercase names. Paths are relative to include root.
     */
    this.addFile= function(key, filename){
        if (!Audio){
            return false;
        }
        var extensionRegEx = /\.([a-z0-9]{1,4})$/i;
        if (extensionRegEx.test(filename)){
            //if extension supplied, use it.            
        } else if (isSupportedAudioType('ogg')){
            filename+='.ogg';
        } else if (isSupportedAudioType('mp3')){
            filename+='.mp3';
        }
        var audio = new Audio(filename);
        stopAudio(audio);        
        var matches = extensionRegEx.exec(filename);
        audio.type = supportedFormats[matches[1]];
        audio.loop = false;
        audio.autobuffer = true;
        audio.load(); //does not work in iOS
        
        /** @todo Preload audio files. */
        if (audio.src){
            fileList[key] = audio;
        }        
    };
    /** @param {String} key The file to delete. */
    this.remove = function(key){
        if (fileList[key]){
            delete fileList[key];
        }
    };
    
    /** @param {String} key The file to play. */
    this.play = function(key){
        if (fileList[key]){
            playAudio(fileList[key]);            
        } else {
            throw new Error('File "'+key+'" does not exists.');
        }
    };
    /** @param {String} key The file to stop. */
    this.stop = function(key){
        if (fileList[key]){
            stopAudio(fileList[key]);
        } else {
            throw new Error('File "'+key+'" does not exists.');
        }        
    };
    /** Stops all audio tracks playing. */
    this.stopAll = function(){
        for (var key in fileList){
            stopAudio(fileList[key]);
        }
    };
};