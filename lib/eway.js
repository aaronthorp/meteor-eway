//! eway.js
//! version : 0.0.8
//! authors : Aaron Thorp
//! license : MIT
//! aaronthorp.com

Future = Npm.require('fibers/future');

jsonxml = Npm.require('jsontoxml');
xml2js = Npm.require('xml2js');

request = Npm.require('request');

var VERSION = "0.0.8";
        
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

    var envelope = {
      "soap:Header": [
        {
          name: 'eWAYHeader', 
          attrs: {xmlns: 'https://www.eway.com.au/gateway/managedpayment'}, 
          children: [
            {eWAYCustomerID: options.customer_id},
            {Username: options.username},
            {Password: options.password}
          ]
        }
      ],
      "soap:Body": {}
    };
    
    //console.log(jsonxml(envelope));
    
    switch (mode) {
      case 'createCustomer':
        return processTokenCreateCustomer('create', envelope, transaction, options);
      case 'updateCustomer':
        return processTokenCreateCustomer('update', envelope, transaction, options);
      case 'queryCustomer':
        return processTokenCreateCustomer('query', envelope, transaction, options);
      case 'processPayment':
        return processTokenProcessPayment(envelope, transaction, options);
      case 'queryPayment':
        return processTokenCreateCustomer('payments', envelope, transaction, options);
      default:
        throw new Error('Token Transaction: Invalid Mode [createCustomer|updateCustomer|queryCustomer|processPayment|queryPayment]');
    } 
    
  };
  
};