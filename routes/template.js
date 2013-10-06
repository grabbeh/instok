
var User = require('../models/user.js')
, Template = require('../models/template.js')
, Alert = require('../models/alert.js')


exports.addTemplate = function(req,res){
   new Template({
	   	title: req.body.title,
	   	content: req.body.content,
	   	id: req.body.id
   		}).save(function(err, template){
			User.findOne({_id: req.user._id})
		       .update({$addToSet: {templates: template._id}})
		       .exec()
			})
   		}

exports.getTemplates = function(req, res){
	User.findOne({_id: req.user._id})
		.select('templates')
        .populate('templates')
        .exec(function(err, templates){
        	res.json(templates);
        })
}

exports.getTemplate = function(req, res){
	Template.findOne({id: req.params.id}, function(err, template){
		res.json(template);
	})
}

exports.editTemplate = function(req, res){
	Template.update({id: req.params.id},
		{ title: req.body.title,
		  content: req.body.content
		}, function(err, template){
			res.json("Template updated");
		})
}

exports.deleteTemplate = function(req, res){
	Template.findOne({id: req.params.id}, function(err, template){
		User.findOne({_id: req.user._id})
			  .update({pull: {templates: template._id}})
			  .exec(function(){
			  	template.remove();
			  })
	 		})
		}

   

