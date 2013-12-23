processTokenProcessPayment = function(payload, transaction, options) {    
    
  fut = new Future();
  
  var payment = {};
  var paymentMode = 'ProcessPayment';

  var tokenURL = {
    "live": "https://www.eway.com.au/gateway/ManagedPaymentService/managedCreditCardPayment.asmx",
    "sandbox": "https://www.eway.com.au/gateway/ManagedPaymentService/test/managedCreditCardPayment.asmx"
  };

  paymentURL = tokenURL[options.mode];

  
  var paymentPossibleFields = [
    'managedCustomerID', 'amount', 'invoiceReference', 'invoiceDescription'
  ];  
  
  var paymentRequiredFields = [
    'managedCustomerID', 'amount'
  ];

  var paymentIsValid = true;
  var errorSent = false;
  
  paymentRequiredFields.forEach(function(item) {
    if (!transaction[item]) {
      paymentIsValid = false;
      if (!errorSent) {
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});
        errorSent = true;      
      }
    }
  });
  
  if (paymentIsValid) {
        
    paymentPossibleFields.forEach(function(item) {
      if (transaction[item])
        payment[item] = transaction[item];
      else
        payment[item] = '';
    });
    
    payload['soap:Body'] = [
      {
        name: paymentMode, 
        attrs: {
          xmlns: 'https://www.eway.com.au/gateway/managedpayment'
        }, 
        children: payment
      }
    ];

    var envelope = [
      {
        name: 'soap:Envelope', 
        attrs: {
          'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
          'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
          'xmlns:xsd': "http://www.w3.org/2001/XMLSchema"
        }, 
        children: payload
      }
    ];

    var xml = '<?xml version="1.0" encoding="utf-8"?>'+jsonxml(envelope);
  
    var timeoutInMilliseconds = 10*1000;
    
    var opts = {
      url: tokenURL[options.mode],
      timeout: timeoutInMilliseconds,
      method: "POST",
      body: xml,
      headers: {
        "Accept": "text/xml",
        "Content-type": "text/xml; charset=utf-8",
        "Content-length": xml.length,
        "SOAPAction": "https://www.eway.com.au/gateway/managedpayment/"+paymentMode
      }
    };
    
    console.log(xml);
    
    request(opts, function (err, res, body) {
      
      if (err) {
        fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+err+'"'});
      }
 
      xml2js.parseString(res.body, function(err, res) {
        
        var body =res["soap:Envelope"]["soap:Body"];

        var fault = body[0]['soap:Fault'];
        
        if (fault)
          fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+fault[0]['faultstring'][0]+'"'});
        else {   
        
          if (body)
            var response = body[0][paymentMode+"Response"];

          if (response)
            var result = response[0]["ewayResponse"][0]
          
          if (result) {
            if (result === 'true' || result === 'false')
              fut.return(result === 'true');
            else
              fut.return(result);
          }
        } 
        
      });
      
    });
  }
  
  return fut.wait();
  
};