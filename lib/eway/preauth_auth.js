// PreAuth - Pre Authorisation Payment to eWay

var Future = Npm.require('fibers/future');
var jsonxml = Npm.require('jsontoxml');
var xml2js = Npm.require('xml2js');

var request = Npm.require('request');

processPreAuthTransaction = function(transaction, options) {    
    
  var fut = new Future();
  
  if (!options.customer_id)
    fut.return({TrxnStatus: false, TrxnError: '99,No customer Id provided'});
    
  if (!transaction)
    fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway'});

  var preauthMode = 'live';
  
  if (options)
    preauthMode = options.mode || "live";
  
  var preauthURL = {
    live: 'https://www.eway.com.au/gateway_cvn/xmlauth.asp',
    sandbox: 'https://www.eway.com.au/gateway_cvn/xmltest/authtestpage.asp'
  };

  var preauthPossibleFields = [
    'TotalAmount', 'CustomerFirstName', 'CustomerLastName', 'CustomerEmail','CustomerAddress',
    'CustomerPostcode', 'CustomerInvoiceDescription', 'CustomerInvoiceRef', 'CardHoldersName', 'CardNumber',
    'CardExpiryMonth', 'CardExpiryYear', 'TrxnNumber', 'Option1', 'Option2', 'Option3', 'CVN'
  ];  
  
  var preauthRequiredFields = [
    'TotalAmount', 'CardHoldersName', 'CardNumber', 'CardExpiryMonth',  'CardExpiryYear', 'CVN'];
  
  var preauthPacket = {
    ewaygateway: {
      ewayCustomerID: options.customer_id
    }
  };
  
  var preauthIsValid = true;
  var errorSent = false;
  
  preauthRequiredFields.forEach(function(item) {
    if (!transaction[item]) {
      preauthIsValid = false;
      if (!errorSent) {
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});
        errorSent = true;      
      }
    }
  });
  
  if (preauthIsValid) {
    
    preauthPossibleFields.forEach(function(item) {
      if (transaction[item])
        preauthPacket.ewaygateway["eway"+item] = transaction[item];
      else
        preauthPacket.ewaygateway["eway"+item] = '';
    });
    
    var xml = jsonxml(preauthPacket);
  
    var timeoutInMilliseconds = 10*1000;
    
    var opts = {
      url: preauthURL[preauthMode],
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
          TrxnReference: res.ewayResponse.ewayTrxnReference[0],
          TrxnOption1: res.ewayResponse.ewayTrxnOption1[0],
          TrxnOption2: res.ewayResponse.ewayTrxnOption2[0],
          TrxnOption3: res.ewayResponse.ewayTrxnOption3[0],
          AuthCode: res.ewayResponse.ewayAuthCode[0],
          ReturnAmount: res.ewayResponse.ewayReturnAmount[0],
          TrxnError: res.ewayResponse.ewayTrxnError[0],
          TrxnMode: preauthMode,
          TrxnType: 'preauth_auth'
        };
        
        result.TrxnStatus = (result.TrxnStatus === 'True');
        
        fut.return(result);
      });
      
    });
    
  }

  return fut.wait();
};

