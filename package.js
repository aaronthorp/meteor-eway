Package.describe({
  summary: "eWay Gateway, an Integration module for accepting payments through the eWay gateway. See http://www.eway.com.au."
});

var both = ['client', 'server']

Package.on_use(function (api) {

  api.add_files('lib/eway/eway.js', 'server');

  if (typeof api.export !== 'undefined') {
    api.export('eWay', 'server');
  }
  
});