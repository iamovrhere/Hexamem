if (typeof HexamemEngine === 'undefined'){
    HexamemEngine = function(){};
}
/**
 * Retrieves the storage module for storing and recording 
 * offline non-temporal data. 
 * 
 * @version 0.1.0-20140411
 * @author Jason J.
 * @type HexamemEngine.prototype.Storage
 * @returns {HexamemEngine.prototype.Storage}
 */
HexamemEngine.prototype.Storage = function(){
    if (HexamemEngine.prototype.__my_StorageModule){
        return HexamemEngine.prototype.__my_StorageModule;
    };
    
    /** @type string The name of our localStore for encapsulation purposes. */
    var  storageKey = 'HexamemEngine_Storage';
    
    /** Checks and prepares the local storage for receiving records. 
     * @return {Object|0} The parsed current local storage object 
     * (or 0 when localStorage does not exist). */
    function checkStorage(){
        if (localStorage){
            var value = localStorage.getItem(storageKey);
            if (!value){
                value = JSON.stringify({});
                localStorage.setItem(storageKey,value);
            }            
            return JSON.parse(value);
        }
        return 0;
    }
    
    //storaged for future reference.
    HexamemEngine.prototype.__my_StorageModule = {
    //var module = {
        /** Erases all storage. */
        clearStorage:function(){
            if (localStorage){
                localStorage.removeItem(storageKey);
            }
        },
        /** @param {string} key The key to set 
         *  @param {mixed} item The value to store. Note that this will be 
         *  stringified. before storage. */
        setRecord: function(key, item){
            if (localStorage){
                var obj = checkStorage();
                obj[key] = item;
                localStorage.setItem(storageKey, JSON.stringify(obj));
            }
        },
        /** @param {string} key The key to set 
         *  @return {mixed} The record from storage or null if non-existent. */
        getRecord: function(key) {
            if (localStorage){
                var obj = checkStorage();
                return obj[key];
            }
            return null;
        }
    };    
     return HexamemEngine.prototype.__my_StorageModule;
};