Package.describe({
  summary: "eWay Gateway, an Integration module for accepting payments through the eWay gateway."
});

var both = ['client', 'server'];

Npm.depends({
    "jsontoxml": "0.0.11",
    "xml2js": "0.4.0",
    "request": "2.30.0"
});

Package.on_use(function (api) {

  api.use('underscore', 'server');

  api.add_files('lib/functions.js', 'server');

  api.add_files('lib/direct/direct.js', 'server');

  api.add_files('lib/preauth/preauth_auth.js', 'server');
  api.add_files('lib/preauth/preauth_complete.js', 'server');
  api.add_files('lib/preauth/preauth_cancel.js', 'server');

  api.add_files('lib/token/create_customer.js', 'server');
  api.add_files('lib/token/create_payment.js', 'server');

  api.add_files('lib/eway.js', 'server');

  if (typeof api.export !== 'undefined') {
    api.export('eWay', 'server');
  }
  
});