//! eway.js
//! version : 0.1.0
//! authors : Aaron Thorp
//! license : MIT
//! aaronthorp.com

var VERSION = "0.1.0",
        
        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports);

eWay = {
  version: function() {
    return VERSION;
  },
  direct: processDirectTransaction
  
}