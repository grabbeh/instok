var User = require('../models/user.js');
var stripeauth = require('../config/stripeapi.js')
var api_key = stripeauth.api_key;
var Stripe = require('stripe')(api_key);

exports.createCharge = function(req, res){
	Stripe.charges.create({
		amount: req.body.amount,
		card: req.body.token,
		currency: "gbp"
	}, function(error, charge){
		if (error) {
			res.send(error.message);
		}
		else {
			var newcredits = Number(req.session.user.credits) + Number(req.body.credits);

			User.update({_id: req.session.user._id}, ({credits: newcredits}), function(err){
			});
			res.send("Payment completed successfully. " + req.body.credits + " credits added to your account")
		}
	});
}