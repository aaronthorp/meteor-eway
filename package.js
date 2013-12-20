Package.describe({
  summary: "eWay Gateway, an Integration module for accepting payments through the eWay gateway. See http://www.eway.com.au."
});

var both = ['client', 'server']

Npm.depends({
    "jsontoxml": "0.0.11",
    "xml2js": "0.4.0",
    "request": "2.30.0"
});

Package.on_use(function (api) {

  api.add_files('lib/eway/direct.js', 'server');

  api.add_files('lib/eway/preauth_auth.js', 'server');
  api.add_files('lib/eway/preauth_complete.js', 'server');
  api.add_files('lib/eway/preauth_cancel.js', 'server');

  api.add_files('lib/eway/eway.js', 'server');

  if (typeof api.export !== 'undefined') {
    api.export('eWay', 'server');
  }
  
});