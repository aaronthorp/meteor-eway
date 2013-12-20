//! eway.js
//! version : 0.0.2
//! authors : Aaron Thorp
//! license : MIT
//! aaronthorp.com

var VERSION = "0.0.2";
        
eWay = function(opt) {
  var self = this; 
  var options = opt || {};
  options.mode = options.mode || 'live';
  
  this.version = VERSION;   
  
  // public variable declerations
  Object.defineProperty(this,"options",{get:function(){return options},set:function(val){options=val}});
  Object.defineProperty(this,"version",{get:function(){return VERSION}});

  if (!(self instanceof eWay)) {
    throw new Error('use "new" to construct a eWay object.');
  }

  if (!options.customer_id) {
    throw new Error('"customer_id" was not defined in options.');
  }
  
  this.version = function() {
    return VERSION;
  };
  
  this.direct = function(transaction) {
    
    if (!options.customer_id) {
      throw new Error('Direct Transaction: "customer_id" was not defined in options.');
    }

    return processDirectTransaction(transaction, options); 
  }
  
}