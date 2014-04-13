if (typeof HexamemEngine === 'undefined'){
    HexamemEngine = function(){};
}
/**
 * Retrieves a new audio manager for storing and playback of audio files.
 * Supports .mp3 & .ogg .
 * 
 * @version 0.2.0-20140412
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
    /** Returns if supported by the browser.
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
            a.muted = false;
            a.pause();
            try{
                a.currentTime = 0;
            } catch (e){}
            a.play();
        }
    };
    
   
    //Has issues with iOS/mobile browsers
    /** used to preload the audio in iOS,etc by playing and stopping it quickly. 
     * @param {Element|Audio} audio The audio element to preload. 
     * @param {Function} callback The function to call when the audio has loaded. */
    function preloadAudio(audio, callback){
        //audio.play();
        //iOS: will not work in browser (unless user action) 
        //but will work on homescreen.
        audio.load();    
        //audio.preload = 'auto';        
        //audio.muted = true;
        var canPlay = function(){
            //console.log(audio.src)
            audio.pause();
            //audio.currentTime = audio.duration; //move to end.
            //audio.play();
            callback();
            audio.removeEventListener('canplay', canPlay, false);
            audio.removeEventListener('canplaythrough', canPlay, false);
        };
        var progress = function(){
            try{
                audio.removeEventListener('progress', progress, false);
                audio.removeEventListener('playing', progress, false);
                //audio.pause();
                audio.currentTime = audio.duration; //move to end.             
            } catch (e){}
        };
        var loadStart = function(){
            //audio.pause();
            audio.removeEventListener('loadstart', loadStart, false);
        };
        //audio.addEventListener('loadstart', loadStart, false);        
        //audio.addEventListener('progress', progress, false);
        //audio.addEventListener('playing', progress, false);
        audio.addEventListener('canplay', canPlay, false);
        audio.addEventListener('canplaythrough', canPlay, false);
    }
    
    
    /** Adds file to the file list.
     * @param {String} key The key to store it under (must be unique).
     * @param {String} filename The filename/location. If the file extension is 
     * @param {Function} callback (Optional) The function to call when the file 
     * has loaded.
     * omitted, "ogg" and "mp3" will be tried for different browsers. 
     * Assumes similiar, lowercase names. Paths are relative to include root.
     */
    this.addFile= function(key, filename, callback){
        if (!Audio){
            return false;
        }
        if (!callback){
            callback = function(){};
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
        
        preloadAudio(audio, callback);
        
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