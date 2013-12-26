processTokenCreateCustomer = function(mode, payload, transaction, options) {    
    
  fut = new Future();
  
  var customer = {};
  var customerMode = '';

  var customerIsValid = true;
  var errorSent = false;

  var tokenURL = {
    "live": "https://www.eway.com.au/gateway/ManagedPaymentService/managedCreditCardPayment.asmx",
    "sandbox": "https://www.eway.com.au/gateway/ManagedPaymentService/test/managedCreditCardPayment.asmx"
  };

  customerURL = tokenURL[options.mode];

  switch (mode) {
    case 'create':
      customerMode = 'CreateCustomer';
      break;
    case 'update':
      if (!transaction.managedCustomerID) {
        errorSent = true;
        fut.return({TrxnStatus: false, TrxnError: 'Token Transaction: Managed Customer ID Required to update customer'});
      } else {
        customer.managedCustomerID = transaction.managedCustomerID;
        customerMode = 'UpdateCustomer';
      }
      break;
    case "query":
       if (!transaction.managedCustomerID) {
        errorSent = true;
        fut.return({TrxnStatus: false, TrxnError: 'Token Transaction: Managed Customer ID Required to query customer'});
      } else {
        customerMode = 'QueryCustomer';
      }
      break;
    case "payments":
      //query payments for a customer
       if (!transaction.managedCustomerID) {
        errorSent = true;
        fut.return({TrxnStatus: false, TrxnError: 'Token Transaction: Managed Customer ID Required to query customer payments'});
      } else {
        customerMode = 'QueryPayment';
      }
      break;
    default:
      fut.return({TrxnStatus: false, TrxnError: 'Token Transaction: Invalid customer action'});
  }
  
  var customerPossibleFields = [
    'CustomerRef', 'Title', 'FirstName', 'LastName', 'Company', 'JobDesc', 'Email', 'Address', 'Suburb',
    'Postcode', 'Country', 'Phone', 'Mobile', 'Fax', 'URL', 'Comments', 'CCNumber', 'CCNameOnCard', 
    'CCExpiryMonth', 'CCExpiryYear', 'CVN'
  ];  
  
  var customerRequiredFields = [
    'Title', 'FirstName', 'LastName', 'Country' , 'CCNumber', 'CCNameOnCard', 'CCExpiryMonth', 'CCExpiryYear', 'CVN'
  ];

  if (customerMode === 'QueryCustomer' || customerMode === 'QueryPayment') {
    // if it is a query then the only field reqired is the managed Customer ID
    customerPossibleFields = ['managedCustomerID'];
    customerRequiredFields = ['managedCustomerID'];
  }
  
  customerRequiredFields.forEach(function(item) {
    if (!transaction[item]) {
      customerIsValid = false;
      if (!errorSent) {
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});
        errorSent = true;      
      }
    }
  });
  
  if (!errorSent) {
  
    if (customerIsValid && customerMode !== '') {
          
      customerPossibleFields.forEach(function(item) {
        if (transaction[item])
          customer[item] = transaction[item];
        else
          customer[item] = '';
      });
      
      payload['soap:Body'] = [
        {
          name: customerMode, 
          attrs: {
            xmlns: 'https://www.eway.com.au/gateway/managedpayment'
          }, 
          children: customer
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
          "SOAPAction": "https://www.eway.com.au/gateway/managedpayment/"+customerMode
        }
      };
      
      request(opts, function (err, res, body) {
        
        if (err) {
          fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+err+'"'});
        }
   
        xml2js.parseString(res.body, function(err, res) {
          
          var body = res["soap:Envelope"]["soap:Body"];
  
          var fault = body[0]['soap:Fault'];
          
          if (fault)
            fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+fault[0]['faultstring'][0]+'"'});
          else {   
          
            if (body)
              var response = body[0][customerMode+"Response"];
    
            if (response)
              var result = response[0][customerMode+"Result"][0];
            
            if (customerMode === 'QueryPayment') {
              result = result.ManagedTransaction;
            }
            
            if (result) {
              if (result === 'true' || result === 'false')
                fut.return(result === 'true');
              else
                if (result instanceof Object)
                  fut.return(FixArrays(result));
                else
                  fut.return(result);
            }
          } 
          
        });
        
      });
    }
  }
  
  return fut.wait();
  
};