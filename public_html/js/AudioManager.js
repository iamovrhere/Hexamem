if (typeof HexamemEngine === 'undefined'){
    HexamemEngine = function(){};
}
/**
 * Retrieves a new audio manager for storing and playback of audio files.
 * Supports .mp3 & .ogg .
 * 
 * Has experimental sprite functionality.
 * 
 * @version 0.3.0-20140413
 * @author Jason J.
 * @type HexamemEngine.prototype.AudioManager
 * @returns {HexamemEngine.prototype.AudioManager}
 */
HexamemEngine.prototype.AudioManager = function(){
    /** @type Object|Audio A list of object files names. */
    var fileList = {};
    /** @type object|sprite Sprite interface: { src: Audio, start: 0, end: 0  }. */
    var sprite = { src: '', start:0, end: 0};
    /** @type Object|sprite A list of sprites. */
    var spriteList = {};
    
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
            a.pause();
            try{
                a.currentTime = 0;
            } catch (e){}
            a.play();
        }
    };
    //problematic in iOS
    /** @param {Object|sprite|{src:0,start:0,end:0}} mSprite The sprite to play.  */
    function play_sprite(mSprite){
        if (mSprite.src){
            var a = mSprite.src;
            if (a.play){
                a.pause(); //stop if playing.
                function setAudioTime(audio, time){
                    try {
                      audio.currentTime = time;
                      audio.play();
                    } catch (e) {
                        updateCallback = function () {
                        audio.currentTime = time;
                        audio.play();
                        audio.removeEventListener('playing', updateCallback, false);                        
                      };
                      audio.addEventListener('playing', updateCallback, false);
                      audio.play();
                    }
                }
                setAudioTime(a, mSprite.start);
                
                //as 'timeupdate' updates vary.
                if (mSprite.lastInterval){
                    clearInterval(mSprite.lastInterval);
                }
                mSprite.lastInterval = setInterval(
                        function(){
                            if (a.currentTime >= mSprite.end){
                                a.pause();
                                clearInterval(mSprite.lastInterval);
                            }
                        }, 100);
            }
        }
    };
    
   
    /** Used to preload the audio. 
     * Note: iOS requires this to be called by a user action.
     * @param {Element|Audio} audio The audio element to preload. 
     * @param {Function} update The function to call when the audio has download
     * progress takes one parameter (the percent progress; 0.0 - 1.0).
     * @param {Function} complete The function to call when the audio has loaded. */
    function preloadAudio(audio, update, complete){
        //iOS: will not work in browser (unless user action) 
        //but will work on homescreen.
        audio.load();  
        //audio.play();
        var canPlay = function(){
            audio.pause();
            complete();
            audio.removeEventListener('canplay', canPlay, false);
            audio.removeEventListener('canplaythrough', canPlay, false);
            audio.removeEventListener('progress', progress, false);
        };
        var progress = function(){
            audio.pause();
            if (audio.buffered && audio.duration){
                update(audio.buffered.end(0)/audio.duration);
            } else {
                update(0.0);
            }
        };   
        audio.addEventListener('progress', progress, false);
        audio.addEventListener('canplay', canPlay, false);
        audio.addEventListener('canplaythrough', canPlay, false);
    }
    
    /** Creates an Audio object and returns it based upon the file passed.
     * @param {String} filename The filename/location. If the file extension is 
     * omitted, "ogg" and "mp3" will be tried for different browsers. 
     * Assumes similiar, lowercase names. Paths are relative to include root.  
     * @return {Object|Audio|false} The audio object created and configured.
     * <code>false</code> if Audio object does not exist.
     * */
    function createAudio(filename){
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
        return audio;
    }
    
    ////////////////////////////////////////////////////////////////////////////
    //// Public functions
    ////////////////////////////////////////////////////////////////////////////
    
    /** Adds file to the file list. 
     * @param {String} key The key to store it under. Must be unique to files.
     * @param {String} filename The filename/location. If the file extension is 
     * omitted, "ogg" and "mp3" will be tried for different browsers. 
     * Assumes similiar, lowercase names. Paths are relative to include root.
     * @param {Function} onUpdate (Optional) The function to call when the sprite 
     * has been updated, passed the progress as value between 0.0 - 1.0.
     * @param {Function} onLoad (Optional) The function to call when the file 
     * has loaded.
     */
    this.addFile= function(key, filename, onUpdate, onLoad){
        if (!onLoad){
            onLoad = function(){};
        }
        if (!onUpdate){
            onUpdate = function(){};
        }
        var audio = createAudio(filename);
        if (!audio){
            return false;
        }
        preloadAudio(audio, onUpdate, onLoad);
        
        if (audio.src){
            fileList[key] = audio;
        }        
    };
    /** Sets sprite (segment) using a pre-existing file 
     * (note: each sprite reserves a clone of the file).
     * Sprites should use files with at least 300ms between sounds.
     *  @param {String} fileKey The file to use as our sprite source.
     *  @param {String} spriteKey The key of the segment. Must be unique.
     *  @param {Number} start The start of the sprite (in seconds).
     *  @param {Number} length (Opitonal). The length of the sprite (in seconds). 
     *  Default value is the remainder of the file.
     *  @throws {Error} If the file does not exist or if sprite is outside bounds.
     */
    this.setSprite = function(fileKey, spriteKey, start, length){
        if (fileList[fileKey]){
            var mSprite = {};
            //clone
            mSprite.src = fileList[fileKey].cloneNode();            
            
            if (start < 0){
                throw new Error('Start "'+start+'" out of bounds');
            }
            if (start+length >  fileList[fileKey].duration){
               throw new Error('End "'+length+'" out of bounds'); 
            }
            mSprite.end = length ? start+length : fileList[fileKey].duration;
            mSprite.start = start;
            spriteList[spriteKey] = mSprite;
        } else {
            throw new Error('File "'+fileKey+'" does not exist.');
        }
    };
    
    /** @param {String} key The sprite to delete. */
    this.removeSprite = function(key){
        if (spriteList[key]){
            delete spriteList[key];
        }
    };
    
    /** @param {String} key The file to delete. */
    this.remove = function(key){
        if (fileList[key]){
            delete fileList[key];
        }
    };
    
    /** @param {String} key The file to play. 
     * If no file is found a sprite is played instead.*/
    this.play = function(key){
        if (fileList[key]){
            playAudio(fileList[key]);            
        } else if (spriteList[key] ){
            play_sprite(spriteList[key]);
        } else {
            throw new Error('File "'+key+'" does not exists.');
        }
    };
    /** @param {String} key The file to stop. 
     * If no file is found a sprite is stopped instead. */
    this.stop = function(key){        
        if (fileList[key]){
            stopAudio(fileList[key]);
        } else if (spriteList[key]){            
            stopAudio(spriteList[key].src);
        } else {
            throw new Error('File "'+key+'" does not exists.');
        }        
    };
    
    /** @param {String} key The sprite to play. */
    this.playSprite = function(key){
        if (spriteList[key] ){
            play_sprite(spriteList[key]);
        } else {
            throw new Error('Sprite "'+key+'" does not exists.');
        }
    };
    /** @param {String} key The file to stop. */
    this.stopSprite = function(key){
        if (spriteList[key]){
            stopAudio(spriteList[key].src);
        } else {
            throw new Error('Sprite "'+key+'" does not exists.');
        }        
    };
    
    
    /** Stops all audio tracks playing. */
    this.stopAll = function(){
        for (var key in fileList){
            stopAudio(fileList[key]);
        }
        for (var key in spriteList){
            stopAudio(spriteList[key].src);
        }
    };
};