const path = require('path');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
var accounts = require('./accounts');
var app = express();
const port = 3000;

app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (request,response)=> {
	response.render('index.hbs');
});

app.post('/', (request, response) => {
	if (!request.body || !request.body.account_no || !request.body.pin) {
		response.render('index', { error: 'Please enter all fields.' });
		return;
	}

	var account_no = parseInt(request.body.account_no);
	var pin = parseInt(request.body.pin);

	if (accounts && typeof accounts[account_no] === 'undefined') {
		response.render('index', { error: 'Account number not found.' });
		return;
	}

	if (accounts[account_no].pin != pin) {
		response.render('index', { error: 'Invalid pin.' });
		return;
	}

	response.render('amountForm', {
		account_no: account_no,
		pin: pin,
		amount : accounts[account_no].amount
	});
});

app.get('/withdraw', (request, response) => {
	response.redirect('/');
});

app.post('/withdraw', (request, response) => {
	if (!request.body || !request.body.account_no || !request.body.pin || !request.body.amount) {
		response.redirect('/');
	}

	var account_no = parseInt(request.body.account_no);
	var pin = parseInt(request.body.pin);
	var amount = parseFloat(request.body.amount);

	if (accounts && typeof accounts[account_no] === 'undefined') {
		response.render('index', { error: 'Account number not found.' });
		return;
	}

	if (accounts[account_no].pin != pin) {
		response.render('index', { error: 'Invalid pin.' });
		return;
	}

	var amount_in_account = accounts[account_no].amount;

	if(amount % 10 !== 0) {
		response.render('index', {
			error: 'Cannot withdraw. Withdrawn amount should be in multiple of 10 only.'
		});
		return;
	}

	if(amount <= 0) {
		response.render('index', {
			error: 'Cannot withdraw. Please enter amount greater than 0.'
		});
		return;
	}

	if (amount_in_account - amount < 0.0) {
		response.render('index', {
			error: 'Cannot withdraw. Entered amount is more than available balance.'
		});
		return;
	}

	if( accounts[account_no].amount > 0) {
		accounts[account_no].amount -= amount;
	}

	if( accounts[account_no].amount <= 0) {
		if (typeof accounts[account_no].amount === typeof NaN) {
			accounts[account_no].amount = 0.0;	
		}
	}

	response.render('withdrawed', {
		account_no: account_no,
		amount : amount,
		available_balance: accounts[account_no].amount
	});
});

app.listen(port,() => {
	console.log(`Server is up on port ${port}`);
});