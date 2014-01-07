eWay Gateway API v0.1.2
=======================

An integration module for accepting payments through the eWay gateway. 

More information can be found about the API here: `http://www.eway.com.au/developers/api`

It installs server-side functions for the eWay payment gateway to your code.

Initial release works with processing direct payments to both the live and sandbox environments. I will be implementing more features and payment processing methods soon.

How to install
==============

`mrt add eway`

You will need Meteor _0.6.5+_ for this library to work.

How to use
==========

This module will provide you with an `eWay` component to access the API.

To define the module, you create a new instance of the eWay module and pass in your eWay `customer_id` and optionally the mode of either `live` or `sandbox` (defaulting to live if not provided)

```js
var ewaySandbox = new eWay({customer_id: "87654321", mode: "sandbox"});

var ewayLive = new eWay({customer_id: "87654321"});
```

## Direct Payments

```js
var result = eway.direct(transaction);
```

When calling this function, the transaction variable should contain the fields for the transaction (it requires certain fields to process so if any required fields are missing, an error will be returned.)

An example to the eWay sandbox:
```js
var trans = {
	'TotalAmount':2900,
    'CardHoldersName': 'John Citizen', 
    'CardNumber': '4444333322221111',
    'CardExpiryMonth': "06",
    'CardExpiryYear': "2014", 
    'CVN': '123'
};

var result = ewaySandbox.direct(trans);

console.log(result);
```

This should return the following result:

```
{
  TrxnStatus: true,
  TrxnNumber: '20152',
  TrxnReference: '',
  TrxnOption1: '',
  TrxnOption2: '',
  TrxnOption3: '',
  AuthCode: '123456',
  ReturnAmount: '2900',
  TrxnError: '00,Transaction Approved(Test CVN Gateway)',
  TrxnMode: 'sandbox'
}
```

## PreAuth Payments

```js
var result = eway.preauth('preauth', transaction);

var result = eway.preauth('complete', transaction);

var result = eway.preauth('cancel', transaction);
```

When calling this function, the transaction variable should contain the fields for the transaction (it requires certain fields to process so if any required fields are missing, an error will be returned.)

The PreAuth function will place a hold on the sent amount on the customers credit card until either the `complete` or `cancel` function is called on the transaction.

An example to the eWay sandbox:
```js
var trans = {
	'TotalAmount': 2900,
  'CardHoldersName': 'John Citizen', 
  'CardNumber': '4444333322221111',
  'CardExpiryMonth': "06",
  'CardExpiryYear': "2014", 
  'CVN': '123'
};

var result = ewaySandbox.preauth('preauth', trans);

var post = {
  'AuthTrxnNumber': result.TrxnNumber,
  'TotalAmount': result.TotalAmount
};

var confirmedResult = ewaySandbox.preauth('complete', post);

  or 

var cancelledResult = ewaySandbox.preauth('cancel', post);
```

## Token Payments

```js
var result = eway.token('createCustomer', transaction);

var result = eway.token('updateCustomer', transaction); // Requires managedCustomerID to update

var result = eway.token('processPayment', transaction);

var result = eway.token('queryPayment', transaction);
```
See https://www.eway.com.au/eway-partner-portal/docs/resources/token-payments-field-description.pdf?sfvrsn=0 for more details on fields etc.

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

### Donating
By donating you are supporting this package and its developer so that he may continue to bring you updates to this and other software he maintains.

[![Support us via Gittip][gittip-badge]][aaronthorp]

[gittip-badge]: https://raw.github.com/twolfson/gittip-badge/0.1.0/dist/gittip.png
[aaronthorp]: https://www.gittip.com/aaronthorp/