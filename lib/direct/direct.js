// Direct Payment to eWay

var Future = Npm.require('fibers/future');
var jsonxml = Npm.require('jsontoxml');
var xml2js = Npm.require('xml2js');

var request = Npm.require('request');

processDirectTransaction = function(transaction, options) {    
    
  var fut = new Future();
  
  if (!options.customer_id)
    fut.return({TrxnStatus: false, TrxnError: '99,No customer Id provided'});
    
  if (!transaction)
    fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway'});

  var directMode = 'live';
  
  if (options)
    directMode = options.mode || "live";
  
  var directURL = {
    live: 'https://www.eway.com.au/gateway_cvn/xmlpayment.asp',
    sandbox: 'https://www.eway.com.au/gateway_cvn/xmltest/testpage.asp'
  };

  var directPossibleFields = [
    'TotalAmount', 'CustomerFirstName', 'CustomerLastName', 'CustomerEmail','CustomerAddress',
    'CustomerPostcode', 'CustomerInvoiceDescription', 'CustomerInvoiceRef', 'CardHoldersName', 'CardNumber',
    'CardExpiryMonth', 'CardExpiryYear', 'TrxnNumber', 'Option1', 'Option2', 'Option3', 'CVN'
  ];  
  
  var directRequiredFields = [
    'TotalAmount', 'CardHoldersName', 'CardNumber', 'CardExpiryMonth',  'CardExpiryYear', 'CVN'];
  
  var directPacket = {
    ewaygateway: {
      ewayCustomerID: options.customer_id
    }
  };
  
  var directIsValid = true;
  var errorSent = false;
  
  directRequiredFields.forEach(function(item) {
    if (!transaction[item]) {
      directIsValid = false;
      if (!errorSent) {
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});
        errorSent = true;      
      }
    }
  });
  
  if (directIsValid) {
    
    directPossibleFields.forEach(function(item) {
      if (transaction[item])
        directPacket.ewaygateway["eway"+item] = transaction[item];
      else
        directPacket.ewaygateway["eway"+item] = '';
    });
    
    var xml = jsonxml(directPacket);
  
    var timeoutInMilliseconds = 10*1000;
    
    var opts = {
      url: directURL[directMode],
      timeout: timeoutInMilliseconds,
      method: "POST",
      body: xml
    };
  
    request(opts, function (err, res, body) {
      if (err) {
        console.dir(err);
        fut.return(false);
      }
  
      var statusCode = res.statusCode;
      
      xml2js.parseString(res.body, function(err, res) {
        
        var response = FixArrays(res);
        var result = FixArrays(response.ewayResponse);

        result.ewayTrxnMode = directMode;
        result.ewayTrxnType = 'direct';
        
        result.ewayTrxnStatus = (result.ewayTrxnStatus === 'True');
        
        fut.return(result);
      });
      
    });
    
  }

  return fut.wait();
};

