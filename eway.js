//! eway.js
//! version : 0.0.4
//! authors : Aaron Thorp
//! license : MIT
//! aaronthorp.com

var VERSION = "0.0.4";
        
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
  };
  
  this.preauth = function(mode, transaction) {
    
    if (!options.customer_id) {
      throw new Error('PreAuth Transaction: "customer_id" was not defined in options.');
    }

    switch (mode) {
      case 'preauth':
        return processPreAuthTransaction(transaction, options);
      case 'complete':
        return processPreCompTransaction(transaction, options);
      case 'cancel':
        return processPreCancelTransaction(transaction, options);
      default:
        throw new Error('PreAuth Transaction: Invalid Mode [preauth|complete|cancel]');
    }
    
  };
    
  this.token = function(mode, transaction) {
    
    if (!options.customer_id) {
      throw new Error('Token Transaction: "customer_id" was not defined in options.');
    }

    if (!options.username || !options.password) {
      throw new Error('Token Transaction: "username" and/or "password" was not defined in options.');
    }

    switch (mode) {
      case 'createCustomer':
        return 1;
      case 'updateCustomer':
        return 2;
      case 'queryCustomer':
        return 3;
      case 'processPayment':
        return 4;
      case 'queryPayment':
        return 5;
      default:
        throw new Error('Token Transaction: Invalid Mode [createCustomer|updateCustomer|queryCustomer|processPayment|queryPayment]');
    } 
    
  };
  
};