var User = require('../models/user.js');
var stripeauth = require('../config/stripeapi.js')
var api_key = stripeauth.api_key;
var Stripe = require('stripe')(api_key);

exports.createCharge = function(req, res){
	console.log(req.body)

	Stripe.charges.create({
		amount: req.body.amount,
		card: req.body.token,
		currency: "gbp"
	}, function(error, charge){
		if (error) {
			res.send(error.message);
		}
		else {
			var newcredits = Number(req.user.credits) + Number(req.body.credits);

			User.update({_id: req.user._id}, ({credits: newcredits}), function(err){
			});
			res.send("Payment completed successfully. " + req.body.credits + " credits added to your account")
		}
	});
}