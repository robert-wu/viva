var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appSecret: process.env.BOTFRAMEWORK_APPSECRET 
};

// Create bot
var bot = new builder.BotConnectorBot(botConnectorOptions);
//var bot = new builder.TextBot();
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


dialog.on('Greeting',  [
    function (session) {
        session.sendMessage("Hi, I'm Viva.\n\n\n\n I’m here to help you in the case of an emergency.");
        //next();
    }
    //,
    // function (session, results) {
    //     session.send("I am here to help you.");
    // }
]);

dialog.on('SetupUserProfile', [
    function (session) {
        session.send("Let’s set up your profile.");
    },
    function (session) {
        session.send( " In the case of an emergency, we can communicate your personal information to emergency service operators.");
    },
    function (session) {
        session.send( "What is your full name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send( "What is your sex?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send( "What is your phone number?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send( "What is the phone number of your primary emergency contact?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send( "What is your date of birth?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send( "Do you have any existing medical conditions?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send( "Are you allergic to any medication?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },
    function (session) {
        session.send( "Who is your health provider?");
    },
     function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response); 
    },


    ]);

dialog.on('GetInformation', [
    function (session, args, next) {
        //session.send("getting information for ya " );
       // session.send(JSON.stringify(session));
    	var organization = builder.EntityRecognizer.findEntity(args.entities, 'Organization');
		var medical = builder.EntityRecognizer.findEntity(args.entities, 'Disaster::Medical');
    	var criminal = builder.EntityRecognizer.findEntity(args.entities, 'Disaster::Criminal');
    	var environmental = builder.EntityRecognizer.findEntity(args.entities, 'Disaster::Environmental');

        if(organization){
           // response: organization.entity;
            
            if(organization.entity === "police" ){
                session.send(" ");
            }
            else if(organization.entity === "fire station" ){
                session.send(" ");
            }
            else if(organization.entity === "hospital" ){
                session.send(" ");
            }
            else if(organization.entity === "embassy" ){
               session.send(" ");
            }
        }
        else if(medical){
            if(medical.entity === "heart attack" ){
                session.send("A heart attack usually occurs when there is blockage in one of the heart's arteries." +
                    " This is an emergency that can cause death. It requires quick action. " + 
                    "Do not ignore even minor heart attack symptoms. Immediate treatment lessens heart damage and saves lives.");
            }
            else if(medical.entity === "broken bone" ){
                session.send(" ");
            }
            else if(medical.entity === "not breathing" ){
                session.send(" ");
            }
            else if(medical.entity === "suicide" ){
               session.send(" ");
            }
            else if(medical.entity === "gun wound" ){
               session.send(" ");
            }
            else if(medical.entity === "burn" ){
               session.send(" ");
            }
            //session.send( "Here is what I know about " + medical.entity);
            next({ response: medical.entity });
        }
        else if(criminal){
            session.send( "Here is what I know about " + criminal.entity);
            next({ response: criminal.entity });
        }
    	else if(environmental)
    	{
            session.send( "Here is what I know about " + environmental.entity);
            next({ response: environmental.entity });

    	}
        else{
            session.send("Here is what I know about nothing.");
            next({ response: organization.entity });
        }
    },
    function (session, results) {
         if (results.response) {
            if(results.response == "police")
            {

            }
            session.send("Ok... Added the '%s' task.", results.response);
        }
    }
]);

bot.add('/police',[
    function (session) {
        session.send('Police phone number is blah blah blah.');
    }

    ]); 

dialog.on('ContactOrganization', [
    function (session, args) {
        var organization = builder.EntityRecognizer.findEntity(args.entities, 'Organization');
        var medical = builder.EntityRecognizer.findEntity(args.entities, 'Disaster::Medical');
        var criminal = builder.EntityRecognizer.findEntity(args.entities, 'Disaster::Criminal');
        var environmental = builder.EntityRecognizer.findEntity(args.entities, 'Disaster::Environmental');

        if(organization){
           // response: organization.entity;
            session.send( "Contacting " + organization.entity);
        }
        if(medical){
            session.send( "Contacting " + medical.entity);
        }
        if(criminal){
            session.send( "Contacting " + criminal.entity);
        }
        if(environmental){
            session.send( "Contacting " + environmental.entity);
        }
        else{
            session.send( "Contacting no one");
        }
    },
    function (session, results) {
        

    }
]);


