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


dialog.on('/Greeting',  [
    function (session) {
        session.send("Hello, I'm Viva.");
    },
    function (session) {
        session.send("I’m here to help you in the case of an emergency.");
    },
    
]);

dialog.on('/SetupUserProfile', [
    function (session) {
        session.send(session, "Let’s set up your profile.");
    },
    function (session) {
        session.send(session, " In the case of an emergency, we can communicate your personal information to emergency service operators.");
    },
    function (session) {
        session.send(session, "What is your full name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send(session, "What is your sex?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send(session, "What is your phone number?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send(session, "What is the phone number of your primary emergency contact?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send(session, "What is your date of birth?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send(session, "Do you have any existing medical conditions?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send(session, "Are you allergic to any medication?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send(session, "Who is your health provider?");
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
    	if(!medical){
        	builder.Prompts.text(session, "What would you like to call medical?");
    	}
        else{
            session.send(session, "medical condition is heart attack");
        }
    	if(!criminal){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	if(!environmental){
        	builder.Prompts.text(session, "What would you like me to say?");
    	}
    	else
    	{
            builder.Prompts.text(session, "What would you like me to say?");
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
