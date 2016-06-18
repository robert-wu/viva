var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appSecret: process.env.BOTFRAMEWORK_APPSECRET 
};

// Create bot
var bot = new builder.BotConnectorBot(botConnectorOptions);

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});


var dialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v1/application?id=dbc0fee8-f1bb-4932-a453-98ca65ba1b2c&subscription-key=eea3e95656e74c91b1d45b283cc6a91c');
bot.add('/', dialog);
dialog.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));


dialog.on('/firstRun',  [
    function (session) {
        session.send("Hello, I'm Viva.");
    },
    function (session) {
        session.send("I’m here to help you in the case of an emergency.");
    },
    function (session) {
        session.send(session, "What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    
]);

dialog.on('GetInformation', [
    function (session, args) {
    	var organization = builder.EntityRecognizer.findEntity(args.entities, 'Organization');
		var medical = builder.EntityRecognizer.findEntity(args.entities, 'Medical');
    	var criminal = builder.EntityRecognizer.findEntity(args.entities, 'Criminal');
    	var environmental = builder.EntityRecognizer.findEntity(args.entities, 'Environmental');
    	if(!organization){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	else if(!medical){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	else if(!criminal){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	else if(!environmental){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	else
    	{

    	}
    },
    function (session, results) {
        

    }
]);

dialog.on('ContactOrganization', [
    function (session, args) {
    	var organization = builder.EntityRecognizer.findEntity(args.entities, 'Organization');
		var medical = builder.EntityRecognizer.findEntity(args.entities, 'Medical');
    	var criminal = builder.EntityRecognizer.findEntity(args.entities, 'Criminal');
    	var environmental = builder.EntityRecognizer.findEntity(args.entities, 'Environmental');
    	if(!organization){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	else if(!medical){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	else if(!criminal){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	else if(!environmental){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	else
    	{

    	}
    },
    function (session, results) {
        

    }
]);
