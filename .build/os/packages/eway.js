(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/eway/lib/functions.js                                                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
FixArrays = function(arrayObject) {                                                                                  // 1
                                                                                                                     // 2
  var temp = {};                                                                                                     // 3
                                                                                                                     // 4
   _.each(arrayObject , function(value, key, list) {                                                                 // 5
      if (value instanceof Array)                                                                                    // 6
        if (value.length === 1)                                                                                      // 7
          temp[key] = value[0];                                                                                      // 8
        else                                                                                                         // 9
          temp[key] = value;                                                                                         // 10
      else                                                                                                           // 11
          temp[key] = value;                                                                                         // 12
  });                                                                                                                // 13
                                                                                                                     // 14
  return temp;                                                                                                       // 15
                                                                                                                     // 16
};                                                                                                                   // 17
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/eway/lib/direct/direct.js                                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// Direct Payment to eWay                                                                                            // 1
                                                                                                                     // 2
var Future = Npm.require('fibers/future');                                                                           // 3
var jsonxml = Npm.require('jsontoxml');                                                                              // 4
var xml2js = Npm.require('xml2js');                                                                                  // 5
                                                                                                                     // 6
var request = Npm.require('request');                                                                                // 7
                                                                                                                     // 8
processDirectTransaction = function(transaction, options) {                                                          // 9
                                                                                                                     // 10
  var fut = new Future();                                                                                            // 11
                                                                                                                     // 12
  if (!options.customer_id)                                                                                          // 13
    fut.return({TrxnStatus: false, TrxnError: '99,No customer Id provided'});                                        // 14
                                                                                                                     // 15
  if (!transaction)                                                                                                  // 16
    fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway'});                               // 17
                                                                                                                     // 18
  var directMode = 'live';                                                                                           // 19
                                                                                                                     // 20
  if (options)                                                                                                       // 21
    directMode = options.mode || "live";                                                                             // 22
                                                                                                                     // 23
  var directURL = {                                                                                                  // 24
    live: 'https://www.eway.com.au/gateway_cvn/xmlpayment.asp',                                                      // 25
    sandbox: 'https://www.eway.com.au/gateway_cvn/xmltest/testpage.asp'                                              // 26
  };                                                                                                                 // 27
                                                                                                                     // 28
  var directPossibleFields = [                                                                                       // 29
    'TotalAmount', 'CustomerFirstName', 'CustomerLastName', 'CustomerEmail','CustomerAddress',                       // 30
    'CustomerPostcode', 'CustomerInvoiceDescription', 'CustomerInvoiceRef', 'CardHoldersName', 'CardNumber',         // 31
    'CardExpiryMonth', 'CardExpiryYear', 'TrxnNumber', 'Option1', 'Option2', 'Option3', 'CVN'                        // 32
  ];                                                                                                                 // 33
                                                                                                                     // 34
  var directRequiredFields = [                                                                                       // 35
    'TotalAmount', 'CardHoldersName', 'CardNumber', 'CardExpiryMonth',  'CardExpiryYear', 'CVN'];                    // 36
                                                                                                                     // 37
  var directPacket = {                                                                                               // 38
    ewaygateway: {                                                                                                   // 39
      ewayCustomerID: options.customer_id                                                                            // 40
    }                                                                                                                // 41
  };                                                                                                                 // 42
                                                                                                                     // 43
  var directIsValid = true;                                                                                          // 44
  var errorSent = false;                                                                                             // 45
                                                                                                                     // 46
  directRequiredFields.forEach(function(item) {                                                                      // 47
    if (!transaction[item]) {                                                                                        // 48
      directIsValid = false;                                                                                         // 49
      if (!errorSent) {                                                                                              // 50
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});       // 51
        errorSent = true;                                                                                            // 52
      }                                                                                                              // 53
    }                                                                                                                // 54
  });                                                                                                                // 55
                                                                                                                     // 56
  if (directIsValid) {                                                                                               // 57
                                                                                                                     // 58
    directPossibleFields.forEach(function(item) {                                                                    // 59
      if (transaction[item])                                                                                         // 60
        directPacket.ewaygateway["eway"+item] = transaction[item];                                                   // 61
      else                                                                                                           // 62
        directPacket.ewaygateway["eway"+item] = '';                                                                  // 63
    });                                                                                                              // 64
                                                                                                                     // 65
    var xml = jsonxml(directPacket);                                                                                 // 66
                                                                                                                     // 67
    var timeoutInMilliseconds = 10*1000;                                                                             // 68
                                                                                                                     // 69
    var opts = {                                                                                                     // 70
      url: directURL[directMode],                                                                                    // 71
      timeout: timeoutInMilliseconds,                                                                                // 72
      method: "POST",                                                                                                // 73
      body: xml                                                                                                      // 74
    };                                                                                                               // 75
                                                                                                                     // 76
    request(opts, function (err, res, body) {                                                                        // 77
      if (err) {                                                                                                     // 78
        console.dir(err);                                                                                            // 79
        fut.return(false);                                                                                           // 80
      }                                                                                                              // 81
                                                                                                                     // 82
      var statusCode = res.statusCode;                                                                               // 83
                                                                                                                     // 84
      xml2js.parseString(res.body, function(err, res) {                                                              // 85
                                                                                                                     // 86
        var response = FixArrays(res);                                                                               // 87
        var result = FixArrays(response.ewayResponse);                                                               // 88
                                                                                                                     // 89
        result.ewayTrxnMode = directMode;                                                                            // 90
        result.ewayTrxnType = 'direct';                                                                              // 91
                                                                                                                     // 92
        result.ewayTrxnStatus = (result.ewayTrxnStatus === 'True');                                                  // 93
                                                                                                                     // 94
        fut.return(result);                                                                                          // 95
      });                                                                                                            // 96
                                                                                                                     // 97
    });                                                                                                              // 98
                                                                                                                     // 99
  }                                                                                                                  // 100
                                                                                                                     // 101
  return fut.wait();                                                                                                 // 102
};                                                                                                                   // 103
                                                                                                                     // 104
                                                                                                                     // 105
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/eway/lib/preauth/preauth_auth.js                                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// PreAuth - Pre Authorisation Payment to eWay                                                                       // 1
                                                                                                                     // 2
processPreAuthTransaction = function(transaction, options) {                                                         // 3
                                                                                                                     // 4
  var fut = new Future();                                                                                            // 5
                                                                                                                     // 6
  if (!options.customer_id)                                                                                          // 7
    fut.return({TrxnStatus: false, TrxnError: '99,No customer Id provided'});                                        // 8
                                                                                                                     // 9
  if (!transaction)                                                                                                  // 10
    fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway'});                               // 11
                                                                                                                     // 12
  var preauthMode = 'live';                                                                                          // 13
                                                                                                                     // 14
  if (options)                                                                                                       // 15
    preauthMode = options.mode || "live";                                                                            // 16
                                                                                                                     // 17
  var preauthURL = {                                                                                                 // 18
    live: 'https://www.eway.com.au/gateway_cvn/xmlauth.asp',                                                         // 19
    sandbox: 'https://www.eway.com.au/gateway_cvn/xmltest/authtestpage.asp'                                          // 20
  };                                                                                                                 // 21
                                                                                                                     // 22
  var preauthPossibleFields = [                                                                                      // 23
    'TotalAmount', 'CustomerFirstName', 'CustomerLastName', 'CustomerEmail','CustomerAddress',                       // 24
    'CustomerPostcode', 'CustomerInvoiceDescription', 'CustomerInvoiceRef', 'CardHoldersName', 'CardNumber',         // 25
    'CardExpiryMonth', 'CardExpiryYear', 'TrxnNumber', 'Option1', 'Option2', 'Option3', 'CVN'                        // 26
  ];                                                                                                                 // 27
                                                                                                                     // 28
  var preauthRequiredFields = [                                                                                      // 29
    'TotalAmount', 'CardHoldersName', 'CardNumber', 'CardExpiryMonth',  'CardExpiryYear', 'CVN'];                    // 30
                                                                                                                     // 31
  var preauthPacket = {                                                                                              // 32
    ewaygateway: {                                                                                                   // 33
      ewayCustomerID: options.customer_id                                                                            // 34
    }                                                                                                                // 35
  };                                                                                                                 // 36
                                                                                                                     // 37
  var preauthIsValid = true;                                                                                         // 38
  var errorSent = false;                                                                                             // 39
                                                                                                                     // 40
  preauthRequiredFields.forEach(function(item) {                                                                     // 41
    if (!transaction[item]) {                                                                                        // 42
      preauthIsValid = false;                                                                                        // 43
      if (!errorSent) {                                                                                              // 44
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});       // 45
        errorSent = true;                                                                                            // 46
      }                                                                                                              // 47
    }                                                                                                                // 48
  });                                                                                                                // 49
                                                                                                                     // 50
  if (preauthIsValid) {                                                                                              // 51
                                                                                                                     // 52
    preauthPossibleFields.forEach(function(item) {                                                                   // 53
      if (transaction[item])                                                                                         // 54
        preauthPacket.ewaygateway["eway"+item] = transaction[item];                                                  // 55
      else                                                                                                           // 56
        preauthPacket.ewaygateway["eway"+item] = '';                                                                 // 57
    });                                                                                                              // 58
                                                                                                                     // 59
    var xml = jsonxml(preauthPacket);                                                                                // 60
                                                                                                                     // 61
    var timeoutInMilliseconds = 10*1000;                                                                             // 62
                                                                                                                     // 63
    var opts = {                                                                                                     // 64
      url: preauthURL[preauthMode],                                                                                  // 65
      timeout: timeoutInMilliseconds,                                                                                // 66
      method: "POST",                                                                                                // 67
      body: xml                                                                                                      // 68
    };                                                                                                               // 69
                                                                                                                     // 70
    request(opts, function (err, res, body) {                                                                        // 71
      if (err) {                                                                                                     // 72
        fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+err+'"'});                                // 73
      }                                                                                                              // 74
                                                                                                                     // 75
      var statusCode = res.statusCode;                                                                               // 76
                                                                                                                     // 77
      xml2js.parseString(res.body, function(err, res) {                                                              // 78
                                                                                                                     // 79
        var result = {                                                                                               // 80
          TrxnStatus: res.ewayResponse.ewayTrxnStatus[0],                                                            // 81
          TrxnNumber: res.ewayResponse.ewayTrxnNumber[0],                                                            // 82
          TrxnReference: res.ewayResponse.ewayTrxnReference[0],                                                      // 83
          TrxnOption1: res.ewayResponse.ewayTrxnOption1[0],                                                          // 84
          TrxnOption2: res.ewayResponse.ewayTrxnOption2[0],                                                          // 85
          TrxnOption3: res.ewayResponse.ewayTrxnOption3[0],                                                          // 86
          AuthCode: res.ewayResponse.ewayAuthCode[0],                                                                // 87
          ReturnAmount: res.ewayResponse.ewayReturnAmount[0],                                                        // 88
          TrxnError: res.ewayResponse.ewayTrxnError[0],                                                              // 89
          TrxnMode: preauthMode,                                                                                     // 90
          TrxnType: 'preauth_auth'                                                                                   // 91
        };                                                                                                           // 92
                                                                                                                     // 93
        result.TrxnStatus = (result.TrxnStatus === 'True');                                                          // 94
                                                                                                                     // 95
        fut.return(result);                                                                                          // 96
      });                                                                                                            // 97
                                                                                                                     // 98
    });                                                                                                              // 99
                                                                                                                     // 100
  }                                                                                                                  // 101
                                                                                                                     // 102
  return fut.wait();                                                                                                 // 103
};                                                                                                                   // 104
                                                                                                                     // 105
                                                                                                                     // 106
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/eway/lib/preauth/preauth_complete.js                                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// PreAuth - Complete Payment to eWay                                                                                // 1
                                                                                                                     // 2
var Future = Npm.require('fibers/future');                                                                           // 3
var jsonxml = Npm.require('jsontoxml');                                                                              // 4
var xml2js = Npm.require('xml2js');                                                                                  // 5
                                                                                                                     // 6
var request = Npm.require('request');                                                                                // 7
                                                                                                                     // 8
processPreCompTransaction = function(transaction, options) {                                                         // 9
                                                                                                                     // 10
  var fut = new Future();                                                                                            // 11
                                                                                                                     // 12
  if (!options.customer_id)                                                                                          // 13
    fut.return({TrxnStatus: false, TrxnError: '99,No customer Id provided'});                                        // 14
                                                                                                                     // 15
  if (!transaction)                                                                                                  // 16
    fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway'});                               // 17
                                                                                                                     // 18
  var precompMode = 'live';                                                                                          // 19
                                                                                                                     // 20
  if (options)                                                                                                       // 21
    precompMode = options.mode || "live";                                                                            // 22
                                                                                                                     // 23
  var precompURL = {                                                                                                 // 24
    live: 'https://www.eway.com.au/gateway/xmlauthcomplete.asp',                                                     // 25
    sandbox: 'https://www.eway.com.au/gateway/xmltest/authcompletetestpage.asp'                                      // 26
  };                                                                                                                 // 27
                                                                                                                     // 28
  var precompPossibleFields = [                                                                                      // 29
    'TotalAmount', 'AuthTrxnNumber', 'CardExpiryMonth', 'CardExpiryYear', 'Option1', 'Option2', 'Option3'            // 30
  ];                                                                                                                 // 31
                                                                                                                     // 32
  var precompRequiredFields = [                                                                                      // 33
    'TotalAmount', 'AuthTrxnNumber'];                                                                                // 34
                                                                                                                     // 35
  var precompPacket = {                                                                                              // 36
    ewaygateway: {                                                                                                   // 37
      ewayCustomerID: options.customer_id                                                                            // 38
    }                                                                                                                // 39
  };                                                                                                                 // 40
                                                                                                                     // 41
  var precompIsValid = true;                                                                                         // 42
  var errorSent = false;                                                                                             // 43
                                                                                                                     // 44
  precompRequiredFields.forEach(function(item) {                                                                     // 45
    if (!transaction[item]) {                                                                                        // 46
      precompIsValid = false;                                                                                        // 47
      if (!errorSent) {                                                                                              // 48
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});       // 49
        errorSent = true;                                                                                            // 50
      }                                                                                                              // 51
    }                                                                                                                // 52
  });                                                                                                                // 53
                                                                                                                     // 54
                                                                                                                     // 55
  if (precompIsValid) {                                                                                              // 56
                                                                                                                     // 57
    precompPossibleFields.forEach(function(item) {                                                                   // 58
      if (transaction[item])                                                                                         // 59
        precompPacket.ewaygateway["eway"+item] = transaction[item];                                                  // 60
      else                                                                                                           // 61
        precompPacket.ewaygateway["eway"+item] = '';                                                                 // 62
    });                                                                                                              // 63
                                                                                                                     // 64
    var xml = jsonxml(precompPacket);                                                                                // 65
                                                                                                                     // 66
    var timeoutInMilliseconds = 10*1000;                                                                             // 67
                                                                                                                     // 68
    var opts = {                                                                                                     // 69
      url: precompURL[precompMode],                                                                                  // 70
      timeout: timeoutInMilliseconds,                                                                                // 71
      method: "POST",                                                                                                // 72
      body: xml                                                                                                      // 73
    };                                                                                                               // 74
                                                                                                                     // 75
    request(opts, function (err, res, body) {                                                                        // 76
      if (err) {                                                                                                     // 77
        fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+err+'"'});                                // 78
      }                                                                                                              // 79
                                                                                                                     // 80
      var statusCode = res.statusCode;                                                                               // 81
                                                                                                                     // 82
      xml2js.parseString(res.body, function(err, res) {                                                              // 83
                                                                                                                     // 84
        var result = {                                                                                               // 85
          TrxnStatus: res.ewayResponse.ewayTrxnStatus[0],                                                            // 86
          TrxnNumber: res.ewayResponse.ewayTrxnNumber[0],                                                            // 87
          TrxnOption1: res.ewayResponse.ewayTrxnOption1[0],                                                          // 88
          TrxnOption2: res.ewayResponse.ewayTrxnOption2[0],                                                          // 89
          TrxnOption3: res.ewayResponse.ewayTrxnOption3[0],                                                          // 90
          AuthCode: res.ewayResponse.ewayAuthCode[0],                                                                // 91
          ReturnAmount: res.ewayResponse.ewayReturnAmount[0],                                                        // 92
          TrxnError: res.ewayResponse.ewayTrxnError[0],                                                              // 93
          TrxnMode: precompMode,                                                                                     // 94
          TrxnType: 'preauth_complete'                                                                               // 95
        };                                                                                                           // 96
                                                                                                                     // 97
        result.TrxnStatus = (result.TrxnStatus === 'True');                                                          // 98
                                                                                                                     // 99
        fut.return(result);                                                                                          // 100
      });                                                                                                            // 101
                                                                                                                     // 102
    });                                                                                                              // 103
                                                                                                                     // 104
  }                                                                                                                  // 105
                                                                                                                     // 106
  return fut.wait();                                                                                                 // 107
};                                                                                                                   // 108
                                                                                                                     // 109
                                                                                                                     // 110
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/eway/lib/preauth/preauth_cancel.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// PreAuth - Cancel Payment to eWay                                                                                  // 1
                                                                                                                     // 2
var Future = Npm.require('fibers/future');                                                                           // 3
var jsonxml = Npm.require('jsontoxml');                                                                              // 4
var xml2js = Npm.require('xml2js');                                                                                  // 5
                                                                                                                     // 6
var request = Npm.require('request');                                                                                // 7
                                                                                                                     // 8
processPreCancelTransaction = function(transaction, options) {                                                       // 9
                                                                                                                     // 10
  var fut = new Future();                                                                                            // 11
                                                                                                                     // 12
  if (!options.customer_id)                                                                                          // 13
    fut.return({TrxnStatus: false, TrxnError: '99,No customer Id provided'});                                        // 14
                                                                                                                     // 15
  if (!transaction)                                                                                                  // 16
    fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway'});                               // 17
                                                                                                                     // 18
  var precancelMode = 'live';                                                                                        // 19
                                                                                                                     // 20
  if (options)                                                                                                       // 21
    precancelMode = options.mode || "live";                                                                          // 22
                                                                                                                     // 23
  var precancelURL = {                                                                                               // 24
    live: 'https://www.eway.com.au/gateway/xmlauthvoid.asp',                                                         // 25
    sandbox: 'https://www.eway.com.au/gateway/xmltest/authvoidtestpage.asp'                                          // 26
  };                                                                                                                 // 27
                                                                                                                     // 28
  var precancelPossibleFields = [                                                                                    // 29
    'TotalAmount', 'AuthTrxnNumber', 'Option1', 'Option2', 'Option3'                                                 // 30
  ];                                                                                                                 // 31
                                                                                                                     // 32
  var precancelRequiredFields = [                                                                                    // 33
    'TotalAmount', 'AuthTrxnNumber'                                                                                  // 34
  ];                                                                                                                 // 35
                                                                                                                     // 36
  var precancelPacket = {                                                                                            // 37
    ewaygateway: {                                                                                                   // 38
      ewayCustomerID: options.customer_id                                                                            // 39
    }                                                                                                                // 40
  };                                                                                                                 // 41
                                                                                                                     // 42
  var precancelIsValid = true;                                                                                       // 43
  var errorSent = false;                                                                                             // 44
                                                                                                                     // 45
  precancelRequiredFields.forEach(function(item) {                                                                   // 46
    if (!transaction[item]) {                                                                                        // 47
      precancelIsValid = false;                                                                                      // 48
      if (!errorSent) {                                                                                              // 49
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});       // 50
        errorSent = true;                                                                                            // 51
      }                                                                                                              // 52
    }                                                                                                                // 53
  });                                                                                                                // 54
                                                                                                                     // 55
  if (precancelIsValid) {                                                                                            // 56
                                                                                                                     // 57
    precancelPossibleFields.forEach(function(item) {                                                                 // 58
      if (transaction[item])                                                                                         // 59
        precancelPacket.ewaygateway["eway"+item] = transaction[item];                                                // 60
      else                                                                                                           // 61
        precancelPacket.ewaygateway["eway"+item] = '';                                                               // 62
    });                                                                                                              // 63
                                                                                                                     // 64
    var xml = jsonxml(precancelPacket);                                                                              // 65
                                                                                                                     // 66
    var timeoutInMilliseconds = 10*1000;                                                                             // 67
                                                                                                                     // 68
    var opts = {                                                                                                     // 69
      url: precancelURL[precancelMode],                                                                              // 70
      timeout: timeoutInMilliseconds,                                                                                // 71
      method: "POST",                                                                                                // 72
      body: xml                                                                                                      // 73
    };                                                                                                               // 74
                                                                                                                     // 75
    request(opts, function (err, res, body) {                                                                        // 76
      if (err) {                                                                                                     // 77
        fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+err+'"'});                                // 78
      }                                                                                                              // 79
                                                                                                                     // 80
      var statusCode = res.statusCode;                                                                               // 81
                                                                                                                     // 82
      xml2js.parseString(res.body, function(err, res) {                                                              // 83
                                                                                                                     // 84
        var result = {                                                                                               // 85
          TrxnStatus: res.ewayResponse.ewayTrxnStatus[0],                                                            // 86
          TrxnNumber: res.ewayResponse.ewayTrxnNumber[0],                                                            // 87
          TrxnOption1: res.ewayResponse.ewayTrxnOption1[0],                                                          // 88
          TrxnOption2: res.ewayResponse.ewayTrxnOption2[0],                                                          // 89
          TrxnOption3: res.ewayResponse.ewayTrxnOption3[0],                                                          // 90
          AuthCode: res.ewayResponse.ewayAuthCode[0],                                                                // 91
          ReturnAmount: res.ewayResponse.ewayReturnAmount[0],                                                        // 92
          TrxnError: res.ewayResponse.ewayTrxnError[0],                                                              // 93
          TrxnMode: precancelMode,                                                                                   // 94
          TrxnType: 'preauth_cancel'                                                                                 // 95
        };                                                                                                           // 96
                                                                                                                     // 97
        result.TrxnStatus = (result.TrxnStatus === 'True');                                                          // 98
                                                                                                                     // 99
        fut.return(result);                                                                                          // 100
      });                                                                                                            // 101
                                                                                                                     // 102
    });                                                                                                              // 103
                                                                                                                     // 104
  }                                                                                                                  // 105
                                                                                                                     // 106
  return fut.wait();                                                                                                 // 107
                                                                                                                     // 108
};                                                                                                                   // 109
                                                                                                                     // 110
                                                                                                                     // 111
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/eway/lib/token/create_customer.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
processTokenCreateCustomer = function(mode, payload, transaction, options) {                                         // 1
                                                                                                                     // 2
  fut = new Future();                                                                                                // 3
                                                                                                                     // 4
  var customer = {};                                                                                                 // 5
  var customerMode = '';                                                                                             // 6
                                                                                                                     // 7
  var customerIsValid = true;                                                                                        // 8
  var errorSent = false;                                                                                             // 9
                                                                                                                     // 10
  var tokenURL = {                                                                                                   // 11
    "live": "https://www.eway.com.au/gateway/ManagedPaymentService/managedCreditCardPayment.asmx",                   // 12
    "sandbox": "https://www.eway.com.au/gateway/ManagedPaymentService/test/managedCreditCardPayment.asmx"            // 13
  };                                                                                                                 // 14
                                                                                                                     // 15
  customerURL = tokenURL[options.mode];                                                                              // 16
                                                                                                                     // 17
  switch (mode) {                                                                                                    // 18
    case 'create':                                                                                                   // 19
      customerMode = 'CreateCustomer';                                                                               // 20
      break;                                                                                                         // 21
    case 'update':                                                                                                   // 22
      if (!transaction.managedCustomerID) {                                                                          // 23
        errorSent = true;                                                                                            // 24
        fut.return({TrxnStatus: false, TrxnError: 'Token Transaction: Managed Customer ID Required to update customer'});
      } else {                                                                                                       // 26
        customer.managedCustomerID = transaction.managedCustomerID;                                                  // 27
        customerMode = 'UpdateCustomer';                                                                             // 28
      }                                                                                                              // 29
      break;                                                                                                         // 30
    case "query":                                                                                                    // 31
       if (!transaction.managedCustomerID) {                                                                         // 32
        errorSent = true;                                                                                            // 33
        fut.return({TrxnStatus: false, TrxnError: 'Token Transaction: Managed Customer ID Required to query customer'});
      } else {                                                                                                       // 35
        customerMode = 'QueryCustomer';                                                                              // 36
      }                                                                                                              // 37
      break;                                                                                                         // 38
    case "payments":                                                                                                 // 39
      //query payments for a customer                                                                                // 40
       if (!transaction.managedCustomerID) {                                                                         // 41
        errorSent = true;                                                                                            // 42
        fut.return({TrxnStatus: false, TrxnError: 'Token Transaction: Managed Customer ID Required to query customer payments'});
      } else {                                                                                                       // 44
        customerMode = 'QueryPayment';                                                                               // 45
      }                                                                                                              // 46
      break;                                                                                                         // 47
    default:                                                                                                         // 48
      fut.return({TrxnStatus: false, TrxnError: 'Token Transaction: Invalid customer action'});                      // 49
  }                                                                                                                  // 50
                                                                                                                     // 51
  var customerPossibleFields = [                                                                                     // 52
    'CustomeRef', 'Title', 'FirstName', 'LastName', 'Company', 'JobDesc', 'Email', 'Address', 'Suburb',              // 53
    'Postcode', 'Country', 'Phone', 'Mobile', 'Fax', 'URL', 'Comments', 'CCNumber', 'CCNameOnCard',                  // 54
    'CCExpiryMonth', 'CCExpiryYear', 'CVN'                                                                           // 55
  ];                                                                                                                 // 56
                                                                                                                     // 57
  var customerRequiredFields = [                                                                                     // 58
    'Title', 'FirstName', 'LastName', 'Country' , 'CCNumber', 'CCNameOnCard', 'CCExpiryMonth', 'CCExpiryYear', 'CVN' // 59
  ];                                                                                                                 // 60
                                                                                                                     // 61
  if (customerMode === 'QueryCustomer' || customerMode === 'QueryPayment') {                                         // 62
    // if it is a query then the only field reqired is the managed Customer ID                                       // 63
    customerPossibleFields = ['managedCustomerID'];                                                                  // 64
    customerRequiredFields = ['managedCustomerID'];                                                                  // 65
  }                                                                                                                  // 66
                                                                                                                     // 67
  customerRequiredFields.forEach(function(item) {                                                                    // 68
    if (!transaction[item]) {                                                                                        // 69
      customerIsValid = false;                                                                                       // 70
      if (!errorSent) {                                                                                              // 71
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});       // 72
        errorSent = true;                                                                                            // 73
      }                                                                                                              // 74
    }                                                                                                                // 75
  });                                                                                                                // 76
                                                                                                                     // 77
  if (!errorSent) {                                                                                                  // 78
                                                                                                                     // 79
    if (customerIsValid && customerMode !== '') {                                                                    // 80
                                                                                                                     // 81
      customerPossibleFields.forEach(function(item) {                                                                // 82
        if (transaction[item])                                                                                       // 83
          customer[item] = transaction[item];                                                                        // 84
        else                                                                                                         // 85
          customer[item] = '';                                                                                       // 86
      });                                                                                                            // 87
                                                                                                                     // 88
      payload['soap:Body'] = [                                                                                       // 89
        {                                                                                                            // 90
          name: customerMode,                                                                                        // 91
          attrs: {                                                                                                   // 92
            xmlns: 'https://www.eway.com.au/gateway/managedpayment'                                                  // 93
          },                                                                                                         // 94
          children: customer                                                                                         // 95
        }                                                                                                            // 96
      ];                                                                                                             // 97
                                                                                                                     // 98
      var envelope = [                                                                                               // 99
        {                                                                                                            // 100
          name: 'soap:Envelope',                                                                                     // 101
          attrs: {                                                                                                   // 102
            'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',                                               // 103
            'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",                                                // 104
            'xmlns:xsd': "http://www.w3.org/2001/XMLSchema"                                                          // 105
          },                                                                                                         // 106
          children: payload                                                                                          // 107
        }                                                                                                            // 108
      ];                                                                                                             // 109
                                                                                                                     // 110
      var xml = '<?xml version="1.0" encoding="utf-8"?>'+jsonxml(envelope);                                          // 111
                                                                                                                     // 112
      var timeoutInMilliseconds = 10*1000;                                                                           // 113
                                                                                                                     // 114
      var opts = {                                                                                                   // 115
        url: tokenURL[options.mode],                                                                                 // 116
        timeout: timeoutInMilliseconds,                                                                              // 117
        method: "POST",                                                                                              // 118
        body: xml,                                                                                                   // 119
        headers: {                                                                                                   // 120
          "Accept": "text/xml",                                                                                      // 121
          "Content-type": "text/xml; charset=utf-8",                                                                 // 122
          "Content-length": xml.length,                                                                              // 123
          "SOAPAction": "https://www.eway.com.au/gateway/managedpayment/"+customerMode                               // 124
        }                                                                                                            // 125
      };                                                                                                             // 126
                                                                                                                     // 127
      request(opts, function (err, res, body) {                                                                      // 128
                                                                                                                     // 129
        if (err) {                                                                                                   // 130
          fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+err+'"'});                              // 131
        }                                                                                                            // 132
                                                                                                                     // 133
        xml2js.parseString(res.body, function(err, res) {                                                            // 134
                                                                                                                     // 135
          var body = res["soap:Envelope"]["soap:Body"];                                                              // 136
                                                                                                                     // 137
          var fault = body[0]['soap:Fault'];                                                                         // 138
                                                                                                                     // 139
          if (fault)                                                                                                 // 140
            fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+fault[0]['faultstring'][0]+'"'});     // 141
          else {                                                                                                     // 142
                                                                                                                     // 143
            if (body)                                                                                                // 144
              var response = body[0][customerMode+"Response"];                                                       // 145
                                                                                                                     // 146
            if (response)                                                                                            // 147
              var result = response[0][customerMode+"Result"][0];                                                    // 148
                                                                                                                     // 149
            if (customerMode === 'QueryPayment') {                                                                   // 150
              result = result.ManagedTransaction;                                                                    // 151
            }                                                                                                        // 152
                                                                                                                     // 153
            if (result) {                                                                                            // 154
              if (result === 'true' || result === 'false')                                                           // 155
                fut.return(result === 'true');                                                                       // 156
              else                                                                                                   // 157
                if (result instanceof Object)                                                                        // 158
                  fut.return(FixArrays(result));                                                                     // 159
                else                                                                                                 // 160
                  fut.return(result);                                                                                // 161
            }                                                                                                        // 162
          }                                                                                                          // 163
                                                                                                                     // 164
        });                                                                                                          // 165
                                                                                                                     // 166
      });                                                                                                            // 167
    }                                                                                                                // 168
  }                                                                                                                  // 169
                                                                                                                     // 170
  return fut.wait();                                                                                                 // 171
                                                                                                                     // 172
};                                                                                                                   // 173
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/eway/lib/token/create_payment.js                                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
processTokenProcessPayment = function(payload, transaction, options) {                                               // 1
                                                                                                                     // 2
  fut = new Future();                                                                                                // 3
                                                                                                                     // 4
  var payment = {};                                                                                                  // 5
  var paymentMode = 'ProcessPayment';                                                                                // 6
                                                                                                                     // 7
  var tokenURL = {                                                                                                   // 8
    "live": "https://www.eway.com.au/gateway/ManagedPaymentService/managedCreditCardPayment.asmx",                   // 9
    "sandbox": "https://www.eway.com.au/gateway/ManagedPaymentService/test/managedCreditCardPayment.asmx"            // 10
  };                                                                                                                 // 11
                                                                                                                     // 12
  paymentURL = tokenURL[options.mode];                                                                               // 13
                                                                                                                     // 14
                                                                                                                     // 15
  var paymentPossibleFields = [                                                                                      // 16
    'managedCustomerID', 'amount', 'invoiceReference', 'invoiceDescription'                                          // 17
  ];                                                                                                                 // 18
                                                                                                                     // 19
  var paymentRequiredFields = [                                                                                      // 20
    'managedCustomerID', 'amount'                                                                                    // 21
  ];                                                                                                                 // 22
                                                                                                                     // 23
  var paymentIsValid = true;                                                                                         // 24
  var errorSent = false;                                                                                             // 25
                                                                                                                     // 26
  paymentRequiredFields.forEach(function(item) {                                                                     // 27
    if (!transaction[item]) {                                                                                        // 28
      paymentIsValid = false;                                                                                        // 29
      if (!errorSent) {                                                                                              // 30
        fut.return({TrxnStatus: false, TrxnError: '99,Invalid data provided to gateway. "'+item+'" missing'});       // 31
        errorSent = true;                                                                                            // 32
      }                                                                                                              // 33
    }                                                                                                                // 34
  });                                                                                                                // 35
                                                                                                                     // 36
  if (paymentIsValid) {                                                                                              // 37
                                                                                                                     // 38
    paymentPossibleFields.forEach(function(item) {                                                                   // 39
      if (transaction[item])                                                                                         // 40
        payment[item] = transaction[item];                                                                           // 41
      else                                                                                                           // 42
        payment[item] = '';                                                                                          // 43
    });                                                                                                              // 44
                                                                                                                     // 45
    payload['soap:Body'] = [                                                                                         // 46
      {                                                                                                              // 47
        name: paymentMode,                                                                                           // 48
        attrs: {                                                                                                     // 49
          xmlns: 'https://www.eway.com.au/gateway/managedpayment'                                                    // 50
        },                                                                                                           // 51
        children: payment                                                                                            // 52
      }                                                                                                              // 53
    ];                                                                                                               // 54
                                                                                                                     // 55
    var envelope = [                                                                                                 // 56
      {                                                                                                              // 57
        name: 'soap:Envelope',                                                                                       // 58
        attrs: {                                                                                                     // 59
          'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',                                                 // 60
          'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",                                                  // 61
          'xmlns:xsd': "http://www.w3.org/2001/XMLSchema"                                                            // 62
        },                                                                                                           // 63
        children: payload                                                                                            // 64
      }                                                                                                              // 65
    ];                                                                                                               // 66
                                                                                                                     // 67
    var xml = '<?xml version="1.0" encoding="utf-8"?>'+jsonxml(envelope);                                            // 68
                                                                                                                     // 69
    var timeoutInMilliseconds = 10*1000;                                                                             // 70
                                                                                                                     // 71
    var opts = {                                                                                                     // 72
      url: tokenURL[options.mode],                                                                                   // 73
      timeout: timeoutInMilliseconds,                                                                                // 74
      method: "POST",                                                                                                // 75
      body: xml,                                                                                                     // 76
      headers: {                                                                                                     // 77
        "Accept": "text/xml",                                                                                        // 78
        "Content-type": "text/xml; charset=utf-8",                                                                   // 79
        "Content-length": xml.length,                                                                                // 80
        "SOAPAction": "https://www.eway.com.au/gateway/managedpayment/"+paymentMode                                  // 81
      }                                                                                                              // 82
    };                                                                                                               // 83
                                                                                                                     // 84
    console.log(xml);                                                                                                // 85
                                                                                                                     // 86
    request(opts, function (err, res, body) {                                                                        // 87
                                                                                                                     // 88
      if (err) {                                                                                                     // 89
        fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+err+'"'});                                // 90
      }                                                                                                              // 91
                                                                                                                     // 92
      xml2js.parseString(res.body, function(err, res) {                                                              // 93
                                                                                                                     // 94
        var body = res["soap:Envelope"]["soap:Body"];                                                                // 95
                                                                                                                     // 96
        var fault = body[0]['soap:Fault'];                                                                           // 97
                                                                                                                     // 98
        if (fault)                                                                                                   // 99
          fut.return({TrxnStatus: false, TrxnError: '99,Transaction Error "'+fault[0]['faultstring'][0]+'"'});       // 100
        else {                                                                                                       // 101
                                                                                                                     // 102
          if (body)                                                                                                  // 103
            var response = body[0][paymentMode+"Response"];                                                          // 104
                                                                                                                     // 105
          if (response)                                                                                              // 106
            var result = response[0]["ewayResponse"][0]                                                              // 107
                                                                                                                     // 108
          if (result) {                                                                                              // 109
            if (result === 'true' || result === 'false')                                                             // 110
              fut.return(result === 'true');                                                                         // 111
            else                                                                                                     // 112
              fut.return(FixArrays(result));                                                                         // 113
          }                                                                                                          // 114
        }                                                                                                            // 115
                                                                                                                     // 116
      });                                                                                                            // 117
                                                                                                                     // 118
    });                                                                                                              // 119
  }                                                                                                                  // 120
                                                                                                                     // 121
  return fut.wait();                                                                                                 // 122
                                                                                                                     // 123
};                                                                                                                   // 124
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/eway/lib/eway.js                                                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
//! eway.js                                                                                                          // 1
//! version : 0.0.8                                                                                                  // 2
//! authors : Aaron Thorp                                                                                            // 3
//! license : MIT                                                                                                    // 4
//! aaronthorp.com                                                                                                   // 5
                                                                                                                     // 6
Future = Npm.require('fibers/future');                                                                               // 7
                                                                                                                     // 8
jsonxml = Npm.require('jsontoxml');                                                                                  // 9
xml2js = Npm.require('xml2js');                                                                                      // 10
                                                                                                                     // 11
request = Npm.require('request');                                                                                    // 12
                                                                                                                     // 13
var VERSION = "0.0.8";                                                                                               // 14
                                                                                                                     // 15
eWay = function(opt) {                                                                                               // 16
  var self = this;                                                                                                   // 17
  var options = opt || {};                                                                                           // 18
  options.mode = options.mode || 'live';                                                                             // 19
                                                                                                                     // 20
  this.version = VERSION;                                                                                            // 21
                                                                                                                     // 22
  // public variable declerations                                                                                    // 23
  Object.defineProperty(this,"options",{get:function(){return options},set:function(val){options=val}});             // 24
  Object.defineProperty(this,"version",{get:function(){return VERSION}});                                            // 25
                                                                                                                     // 26
  if (!(self instanceof eWay)) {                                                                                     // 27
    throw new Error('use "new" to construct a eWay object.');                                                        // 28
  }                                                                                                                  // 29
                                                                                                                     // 30
  if (!options.customer_id) {                                                                                        // 31
    throw new Error('"customer_id" was not defined in options.');                                                    // 32
  }                                                                                                                  // 33
                                                                                                                     // 34
  this.version = function() {                                                                                        // 35
    return VERSION;                                                                                                  // 36
  };                                                                                                                 // 37
                                                                                                                     // 38
  this.direct = function(transaction) {                                                                              // 39
                                                                                                                     // 40
    if (!options.customer_id) {                                                                                      // 41
      throw new Error('Direct Transaction: "customer_id" was not defined in options.');                              // 42
    }                                                                                                                // 43
                                                                                                                     // 44
    return processDirectTransaction(transaction, options);                                                           // 45
  };                                                                                                                 // 46
                                                                                                                     // 47
  this.preauth = function(mode, transaction) {                                                                       // 48
                                                                                                                     // 49
    if (!options.customer_id) {                                                                                      // 50
      throw new Error('PreAuth Transaction: "customer_id" was not defined in options.');                             // 51
    }                                                                                                                // 52
                                                                                                                     // 53
    switch (mode) {                                                                                                  // 54
      case 'preauth':                                                                                                // 55
        return processPreAuthTransaction(transaction, options);                                                      // 56
      case 'complete':                                                                                               // 57
        return processPreCompTransaction(transaction, options);                                                      // 58
      case 'cancel':                                                                                                 // 59
        return processPreCancelTransaction(transaction, options);                                                    // 60
      default:                                                                                                       // 61
        throw new Error('PreAuth Transaction: Invalid Mode [preauth|complete|cancel]');                              // 62
    }                                                                                                                // 63
                                                                                                                     // 64
  };                                                                                                                 // 65
                                                                                                                     // 66
  this.token = function(mode, transaction) {                                                                         // 67
                                                                                                                     // 68
    if (!options.customer_id) {                                                                                      // 69
      throw new Error('Token Transaction: "customer_id" was not defined in options.');                               // 70
    }                                                                                                                // 71
                                                                                                                     // 72
    if (!options.username || !options.password) {                                                                    // 73
      throw new Error('Token Transaction: "username" and/or "password" was not defined in options.');                // 74
    }                                                                                                                // 75
                                                                                                                     // 76
    var envelope = {                                                                                                 // 77
      "soap:Header": [                                                                                               // 78
        {                                                                                                            // 79
          name: 'eWAYHeader',                                                                                        // 80
          attrs: {xmlns: 'https://www.eway.com.au/gateway/managedpayment'},                                          // 81
          children: [                                                                                                // 82
            {eWAYCustomerID: options.customer_id},                                                                   // 83
            {Username: options.username},                                                                            // 84
            {Password: options.password}                                                                             // 85
          ]                                                                                                          // 86
        }                                                                                                            // 87
      ],                                                                                                             // 88
      "soap:Body": {}                                                                                                // 89
    };                                                                                                               // 90
                                                                                                                     // 91
    //console.log(jsonxml(envelope));                                                                                // 92
                                                                                                                     // 93
    switch (mode) {                                                                                                  // 94
      case 'createCustomer':                                                                                         // 95
        return processTokenCreateCustomer('create', envelope, transaction, options);                                 // 96
      case 'updateCustomer':                                                                                         // 97
        return processTokenCreateCustomer('update', envelope, transaction, options);                                 // 98
      case 'queryCustomer':                                                                                          // 99
        return processTokenCreateCustomer('query', envelope, transaction, options);                                  // 100
      case 'processPayment':                                                                                         // 101
        return processTokenProcessPayment(envelope, transaction, options);                                           // 102
      case 'queryPayment':                                                                                           // 103
        return processTokenCreateCustomer('payments', envelope, transaction, options);                               // 104
      default:                                                                                                       // 105
        throw new Error('Token Transaction: Invalid Mode [createCustomer|updateCustomer|queryCustomer|processPayment|queryPayment]');
    }                                                                                                                // 107
                                                                                                                     // 108
  };                                                                                                                 // 109
                                                                                                                     // 110
};                                                                                                                   // 111
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
