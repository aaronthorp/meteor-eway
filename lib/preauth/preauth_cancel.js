// PreAuth - Cancel Payment to eWay

var Future = Npm.require('fibers/future');
var jsonxml = Npm.require('jsontoxml');
var xml2js = Npm.require('xml2js');

var request = Npm.require('request');

processPreCancelTransaction = function(transaction, options) {    
    
  var fut = new Future();
  
  if (!options.customer_id)
    fut.return({TrxnStatus: false, TrxnError: '99,No customer Id provided'});
    
  if (!transaction)
    fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway'});

  var precancelMode = 'live';
  
  if (options)
    precancelMode = options.mode || "live";
  
  var precancelURL = {
    live: 'https://www.eway.com.au/gateway/xmlauthvoid.asp',
    sandbox: 'https://www.eway.com.au/gateway/xmltest/authvoidtestpage.asp'
  };

  var precancelPossibleFields = [
    'TotalAmount', 'AuthTrxnNumber', 'Option1', 'Option2', 'Option3'
  ];  
  
  var precancelRequiredFields = [
    'TotalAmount', 'AuthTrxnNumber'
  ];
  
  var precancelPacket = {
    ewaygateway: {
      ewayCustomerID: options.customer_id
    }
  };
  
  var precancelIsValid = true;
  var errorSent = false;
  
  precancelRequiredFields.forEach(function(item) {
    if (!transaction[item]) {
      precancelIsValid = false;
      if (!errorSent) {
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});
        errorSent = true;      
      }
    }
  });
  
  if (precancelIsValid) {
    
    precancelPossibleFields.forEach(function(item) {
      if (transaction[item])
        precancelPacket.ewaygateway["eway"+item] = transaction[item];
      else
        precancelPacket.ewaygateway["eway"+item] = '';
    });
    
    var xml = jsonxml(precancelPacket);
  
    var timeoutInMilliseconds = 10*1000;
    
    var opts = {
      url: precancelURL[precancelMode],
      timeout: timeoutInMilliseconds,
      method: "POST",
      body: xml
    };
  
    request(opts, function (err, res, body) {
      if (err) {
        fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+err+'"'});
      }
  
      var statusCode = res.statusCode;
      
      xml2js.parseString(res.body, function(err, res) {
              
        var result = {
          TrxnStatus: res.ewayResponse.ewayTrxnStatus[0],
          TrxnNumber: res.ewayResponse.ewayTrxnNumber[0],
          TrxnOption1: res.ewayResponse.ewayTrxnOption1[0],
          TrxnOption2: res.ewayResponse.ewayTrxnOption2[0],
          TrxnOption3: res.ewayResponse.ewayTrxnOption3[0],
          AuthCode: res.ewayResponse.ewayAuthCode[0],
          ReturnAmount: res.ewayResponse.ewayReturnAmount[0],
          TrxnError: res.ewayResponse.ewayTrxnError[0],
          TrxnMode: precancelMode,
          TrxnType: 'preauth_cancel'
        };
        
        result.TrxnStatus = (result.TrxnStatus === 'True');
        
        fut.return(result);
      });
      
    });
    
  }

  return fut.wait();
  
};

