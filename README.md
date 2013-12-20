eWay Gateway API
================

An integration module for accepting payments through the eWay gateway. 

See http://www.eway.com.au for more details including API specs and to setup this gateway for yourself.

It installs server-side functions for the eWay payment gateway to your code.

Initial release works with processing direct payments to both the live and sandbox environments.

How to install
==============

`mrt add eway`

You will need Meteor _0.6.5+_ for this library to work.

How to use
==========

This module will provide you with an `eWay` component to access the API.

More information can be found about the API here: `http://www.eway.com.au/developers/api`

## Direct Payments

`eWay.direct(customer_id, transaction, options);`

When calling this function, the `customer_id` field is your merchant customer ID for eWay, the transaction is the fields for the transaction (it requires certain fields to process so if any required fields are missing, an error will be returned.)

An example to the eWay sandbox:
```js
var trans = {
	'TotalAmount':2900,
    'CardHoldersName': 'Aaron Thorp', 
    'CardNumber': '4444333322221111',
    'CardExpiryMonth': "06",
    'CardExpiryYear': "2014", 
    'CVN': '123'
};

var result = eWay.direct("87654321", trans, {mode: 'sandbox'});

console.log(result);
		
```

## Token Payments
*work in progress...*

## Recurring Payments
*work in progress...*

## Refunds
*work in progress...*

## Rapid Payments
*work in progress...*

## Stored Payments
*work in progress...*

License
=======

MIT
