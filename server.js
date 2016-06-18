var restify = require('restify');
var builder = require('botbuilder');

var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://vive.firebaseio.com/Users/");

var curData = [];

myFirebaseRef.on('value', function(snapshot) {
    curData=snapshot.val();
});

var client = require('twilio')('AC59a2a7d898b46d6b39fa102380816d40', '7f53052dbd2df38c182d0e01331c6f7f');
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
        builder.Prompts.choice(session, "Hi! I'm Viva. Is there an emergency?", "Yes|No");
        //next();
    },
    function (session, results) {
        if(results.response.entity == "Yes"){
                        client.sendMessage({

                to:'+16303019617', // Any number Twilio can deliver to
                from: '+12132701371 ', // A number you bought from Twilio and can use for outbound communication
                body: '"6303019617"' // body of the SMS message

            }, function(err, responseData) { //this function is executed when a response is received from Twilio

                session.send("Your health and contact information has been sent to a local dispatcher. You will receive a phone call shortly from emergency services.");
                if (!err) { // "err" is an error received during the request, if any

                    // "responseData" is a JavaScript object containing data received from Twilio.
                    // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
                    // http://www.twilio.com/docs/api/rest/sending-sms#example-1

                    console.log(responseData.from); // outputs "+14506667788"
                    console.log(responseData.body); // outputs "word to your mother."

                }
                else {
                    console.log(err);
                }
            });
        }
        else{
            session.send("Good! Do you need anything else?");
        }
    }
    //,
    // function (session, results) {
    //     session.send("I am here to help you.");
    // }
]);

dialog.on('GetInformation', [
     function (session) {
        session.send('Your important phone numbers are include ' + curData['numbers']);
    },
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
                session.send("The nearest police station to you is...");
            }
            else if(organization.entity === "fire station" ){
                session.send("The nearest fire station to you is...");
            }
            else if(organization.entity === "hospital" ){
                session.send("The nearest hospital to you is...");
            }
            else if(organization.entity === "embassy" ){
               session.send("The nearest embassy to you is...");
            }
        }
        else if(medical){
            if(medical.entity === "heart attack" ){
                session.send("A heart attack usually occurs when there is blockage in one of the heart's arteries." +
                    " This is an emergency that can cause death. It requires quick action. " + 
                    "Do not ignore even minor heart attack symptoms. Immediate treatment lessens heart damage and saves lives.");
            }
            else if(medical.entity === "broken bone" ){
                session.send("It is hard to tell a dislocated joint from a broken bone. However, both are emergency situations, " + 
                    "and the basic first aid steps are the same. Symptoms of a broken bone include: 1) A visibly out-of-place or misshapen limb or joint 2) Swelling, bruising, or bleeding 3) Intense pain 4) Numbness and tingling" +
                "5) Broken skin with bone protruding 6) Limited mobility or inability to move a limb");
            }
            else if(medical.entity === "not breathing" ){
                session.send("If an adult is unconscious and not breathing, you’ll need to do CPR (which is short for cardiopulmonary resuscitation). " +
                    "CPR involves giving someone a combination of chest compressions and rescue breaths to keep their heart and " +
                    "circulation going to try to save their life. If they start breathing normally again, stop CPR and put them in the " +
                    "recovery position.  Step 1: Check their airway. If they are unconscious, open their airway. Step 2: Check their breathing. " +
                    "If they are not breathing, you need to start CPR (cardiopulmonary resuscitation – a combination of chest pressure and rescue breaths) straight away." +
                    "Step 3: Call for help and start CPR. Step 4: Give chest compressions. Step 5: Give a rescue breath.");
            }
            else if(medical.entity === "suicide" ){
               session.send("A suicidal person may not ask for help, but that doesn't mean that help isn't wanted. Most people who commit suicide " +
                "don't want to die—they just want to stop hurting. Suicide prevention starts with recognizing the warning signs and taking them seriously. " +
                "If you think a friend or family member is considering suicide, you might be afraid to bring up the subject. But talking openly about " +
                "suicidal thoughts and feelings can save a life. If you're thinking about committing suicide, please read Suicide Help or call 1-800-273-TALK in the U.S.!" +
                "To find a suicide helpline outside the U.S., visit IASP or Suicide.org.");
            }
            else if(medical.entity === "gun wound" ){
               session.send("In most circumstances, you don’t want to remove an implanted bullet. It’s almost impossible to find, and it may actually " +
                "be corking up a big blood vessel. Thousands of military members live daily with shrapnel in their bodies. Unless there’s initial " +
                "infection from the wound itself, the body adapts to most metal without much serious problem. Gunshot wounds can run the gamut. " +
                "Some people are too severely injured to save. Get expert treatment as soon as possible.");
            }
            else if(medical.entity === "burn" ){
               session.send("Most minor burns will heal on their own, and home treatment is usually all that is needed to relieve your symptoms and " +
                "promote healing. But if you suspect you may have a more severe injury, use first-aid measures while you arrange for an evaluation " +
                "by your doctor.");
            }
            //session.send( "Here is what I know about " + medical.entity);
            //next({ response: medical.entity });
        }
        else if(criminal){
            session.send( "Here is what I know about " + criminal.entity);
            //next({ response: criminal.entity });
        }
        else if(environmental)
        {
            if(environmental.entity === "tornado" ){
                session.send("Continued vigilance and quick response to tornado watches and warnings are critical, since tornadoes can strike virtually" +
                " anywhere at any time. Most tornadoes are abrupt at onset, short-lived and often obscured by rain or darkness. That's why it's so " +
                "important to plan ahead. Every individual, family, and business should have a tornado emergency plan for their homes or places of work, " +
                "and should learn how to protect themselves in cars, open country, and other situations that may arise. The most important step you can take " +
                "to prepare for a tornado is to have a shelter plan in place. Where will you go when a tornado warning has been issued for your county or city? " +
                "Is it a basement or a storm cellar? Is there an interior room on the ground floor that you can use as a storm shelter? Have a plan, " +
                "and make sure everyone in your family or workplace knows it.");
            }
            else if(environmental.entity === "hurricane" ){
                session.send("To stay safe in a home during a hurricane, stay inside and away from windows, skylights and glass doors. Find a safe area in the " +
                    "home (an interior room, a closet or bathroom on the lower level). If flooding threatens a home, turn off electricity at the main breaker." +
                    "If a home loses power, turn off major appliances such as the air conditioner and water heater to reduce damage. Do not use electrical appliances, " +
                    "including your computer. Do not go outside. If the eye of the storm passes over your area, there will be a short period of calm, but at the other " +
                    "side of the eye, the wind speed rapidly increases to hurricane force and will come from the opposite direction. Also, do not go outside to see " +
                    "what the wind feels like. It is too easy to be hit by flying debris. Beware of lightning. Stay away from electrical equipment. Don't use the " +
                    "phone or take a bath/shower during the storm.");
            }
            else if(environmental.entity === "earthquake" ){
                session.send("There are several common beliefs as to earthquake safety. Many people think having bottled water on hand is a good idea. " + 
                    "That’s true, as long as you have enough. Many are certain that standing in a doorway during the shaking is a good idea. That’s false," +
                     "unless you live in an unreinforced adode structure; otherwise, you're more likely to be hurt by the door swinging wildly in a doorway" + 
                     "or trampled by people trying to hurry outside if you’re in a public place.");
            }
            else if(environment.entity === "fire" ){
               session.send("The average response time for the fire service is 14 minutes. Therefore, you are on your own and must function as " +
                "your own fire fighter for the first several minutes. 'Rescue, alarm, extinguish' is a simple rule to help you remember what to do " + 
                "in the event of a fire. You will have to determine the order in which you address these points, depending on your assessment of " +
                "the situation.");
            }
            //session.send( "Here is what I know about " + environmental.entity);
            //next({ response: environmental.entity });
        }
        else{
            session.send("Here is what I know about nothing.");
            //next({ response: organization.entity });
        }
    }
    //  function (session, results) {
    //      if (results.response) {
    //         if(results.response == "police")
    //         {
    //         }
    //         session.send("Ok... Added the '%s' task.", results.response);
    //     }
    // },

    
]);



dialog.on('SetupUserProfile', [
    function (session) {
        builder.Prompts.text(session, "Let’s set up your profile.\n\n\n\nIn the case of an emergency, we can communicate your personal information to emergency service operators.\n\n\n\nWhat is your full name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        if(curData[results.response] !== undefined){
            sender.send('You are already registered');
        }
        else{
            builder.Prompts.text(session, "Hi " + results.response + "\n\n\n\nWhat's your sex"); 
        }
    },
    function (session, results) {
        session.userData.sex = results.response;
        builder.Prompts.number(session, "What is your phone number?"); 
    },
    function (session, results) {
        session.userData.number = results.response;
        builder.Prompts.text(session, "What is your country?"); 
    },
    function (session, results) {
        session.userData.country = results.response;
        builder.Prompts.text(session, "What is your date of birth"); 
    },
    function (session, results) {
        session.userData.DoB = results.response;
        builder.Prompts.text(session, "Do you have any existing medical conditions?");
    },
    function (session, results) {
        session.userData.medicalConditions = results.response;
        builder.Prompts.text(session, "Are you allergic to any medications?"); 
    },
    function (session, results) {
        session.userData.medicationAllergies = results.response;
        builder.Prompts.text(session, "Last one! What is your health provider"); 
    },
    function (session, results) {
        session.userData.healthProvider = results.response;
        
        myFirebaseRef.child(session.userData.name).set(session.userData);
        country = session.userData.country;
        //session.send(country);
        URLBuilder = 'https://restcountries.eu/rest/v1/name/'+ country;
        //3console.log(URLBuilder);
        HTTPRequest(URLBuilder, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log(body);
                obj= JSON.parse(body);
                //console.log(obj[0].alpha2Code);
                URLBuilder2 = 'http://emergencynumberapi.com/api/country/'+obj[0].alpha2Code;
                //session.send(URLBuilder2);
                //console.log(URLBuilder2);
                HTTPRequest(URLBuilder2, function(error2, response2, body2) {
                    if (!error2 && response2.statusCode == 200) {
                        //console.log(body);
                        obj2 = JSON.parse(body2);
                        out = "";
                        if(obj2.data.fire.all[0]!=""){
                            out += ", Fire: " + obj2.data.fire.all[0];
                        }
                        if(obj2.data.ambulance.all[0]!=""){
                            out += ", Ambulance: " + obj2.data.ambulance.all[0];
                        }
                        if(obj2.data.police.all[0]!=""){
                            out += ", Police: " + obj2.data.police.all[0];
                        }
                        if(obj2.data.dispatch.all[0]!=""){
                            out += ", Dispatch: " + obj2.data.dispatch.all[0];
                        }
                        session.userData.numbers = out.substring(2,200);
                        myFirebaseRef.child(session.userData.name).set(session.userData);
                        //myFirebaseRef.child(session.userData.name).child('numbers').set(session.userData.numbers);
                        //console.log(obj2);
                    }
                    else if(error2){
                        console.log(error2);
                    }
                });
            }
            else if(error){
                console.log(error);
            }
        });

        //session.send("Thanks for your responses. They have been recorded");
        
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






