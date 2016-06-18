var restify = require('restify');
var builder = require('botbuilder');

var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://vive.firebaseio.com/Users/");

var curData = [];

var lastUsedName = "";

myFirebaseRef.on('value', function(snapshot) {
    curData=snapshot.val();
});




var NodeGeocoder = require('node-geocoder');
var request = require("request");




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

dialog.onDefault("I am sorry I didn't understand.");


dialog.on('Greeting',  [
    function (session) {
        builder.Prompts.choice(session, "Hey " + curData[lastUsedName]['name']  + ". Is there an emergency?", "Yes|No");
        //next();
    },
    function (session, results) {
        if(results.response.entity == "Yes"){
            builder.Prompts.text(session,"Now recording your emergency status. What city are you in?");                
        }
        else{
            session.send("Good! Do you need anything else?");
            session.endDialog();
        }
    },
    function(session, results) {
        var city = results.response;
        curData[lastUsedName]['number'] // phone number
        var options = {
            provider: 'google',

            // Optional depending on the providers 
            httpAdapter: 'https', // Default 
            apiKey: 'AIzaSyAbhgQXE4PijQum7zG1jwcpFhGqkujSH1k', // for Mapquest, OpenCage, Google Premier 
            formatter: null         // 'gpx', 'string', ... 
            };

            var geocoder = NodeGeocoder(options);

            // Using callback 
            geocoder.geocode(city, function(err, res) {
            // console.log(res);
            var countryCode = res[0].countryCode;

            // console.log('http://emergencynumberapi.com/api/country/'+countryCode);

            request('http://emergencynumberapi.com/api/country/'+countryCode, function (error, response, body) {
            if (!error && response.statusCode == 200) {
            //console.log(body) // Show the HTML for the Google homepage.
                var json = JSON.parse(body);
                var dispatchNumber = json.data.dispatch.all[0];
                if(dispatchNumber == "") {
                    dispatchNumber = json.data.police.all[0];
                }

                client.sendMessage({

                    to:'+16303019617', // Any number Twilio can deliver to
                    from: '+12132701371 ', // A number you bought from Twilio and can use for outbound communication
                    body: '\n' + 'Name: ' + curData[lastUsedName]['name'] + '\n' + 'Current City: ' + city + '\n' + "Sex: " + curData[lastUsedName]['sex'] + '\n' + "DOB: " + curData[lastUsedName]['DoB'] + '\n' + "Medical Conditions: " + curData[lastUsedName]['medicalConditions'] + '\n' + "Local Number: " + curData[lastUsedName]['number']  + '\n' + "Allergies: " + curData['medicationAllergies'] // body of the SMS message

                }, function(err, responseData) { //this function is executed when a response is received from Twilio

                    session.send("Your health and contact information has been sent to a local dispatcher at number " + dispatchNumber + " in the city " + city  + ". You will receive a phone call shortly from emergency services.");
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
            })

        });


        
    }
    //,
    // function (session, results) {
    //     session.send("I am here to help you.");
    // }
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
            session.endDialog();
        }
        else if(medical){
            if(medical.entity === "heart attack" ){
                console.log("heart attack");
                session.beginDialog('/HeartAttack');
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
            session.endDialog();
           // session.endDialog();
            //session.send( "Here is what I know about " + medical.entity);
            //next({ response: medical.entity });
        }
        else if(criminal){
            if(criminal.entity === "missing person" ){
                session.send("In the case of a missing person, contact your nearest police station and report a missing persons case. Ask that the " +
                    "missing persons case report be sent to the FBI’s National Crime Information Center (https://www.fbi.gov/about-us/cjis/ncic). and " +
                    "the National Missing and Unidentified Persons System (http://www.namus.gov/). If you believe the missing person may be dead, " +
                    "ask if the coroner or medical examiner can take a DNA sample from a family member or the person’s belongings to be compared " +
                    "against the DNA of any unidentified remains.");
            }
            else if(criminal.entity === "robbed" ){
                session.send("In the case of a robbery, stay calm, consider that the safety of you, your customers, and your staff is paramount, " +
                    "and remember as many details as possible. When the incident is over, do not confer with other witnesses and avoid re-watching " +
                    "the surveillance footage as this may affect your memory. Remember that anything touched or left by the robbers is evidence so " +
                    "do not touch anything touched or left by offenders. Fingerprints and DNA can lead to a successful prosecution.");
            }
            else if(criminal.entity === "assaulted" ){
                session.send("Assault is a physical attack or a threat that causes fear of an attack. Victims of assault may be attacked by one or " +
                    "more people. An assault may include one or more types of harm, such as pushing, shoving, slapping, punching, or kicking. " +
                    "It may also include the use of weapons like knives, sticks, bottles, or bats. Common injuries from an assault include bruises, " +
                    "black eyes, cuts, scratches, and broken bones. Victims may even be killed during an assault. Even if the attack results in no " +
                    "physical injury to the victim, it still can be considered an assault.Assault can happen to anyone. Most teen victims of " +
                    "assault report that they know who attacked them, and often the attacker is a family member, friend, or someone the victim " +
                    "knows from school or the neighborhood. If someone assaults you, it is important to tell an adult you trust and to contact " +
                    "the police. Being assaulted is not your fault. It is important to remember that assault is a crime, and as an assault victim, " +
                    "you do not have to deal with this alone. There are people in your community who can help you.");
            }
            else if(criminal.entity === "terrorist attack" ){
                session.beginDialog('/TerroristAttack');
            }
            session.endDialog();
        }
        else if(environmental)
        {
            if(environmental.entity === "tornado" ){
                session.beginDialog('/Tornado');
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
            else if(environmental.entity === "fire" ){
               session.send("The average response time for the fire service is 14 minutes. Therefore, you are on your own and must function as " +
                "your own fire fighter for the first several minutes. 'Rescue, alarm, extinguish' is a simple rule to help you remember what to do " + 
                "in the event of a fire. You will have to determine the order in which you address these points, depending on your assessment of " +
                "the situation.");
            }
            
                session.endDialog();

            
            //session.send( "Here is what I know about " + environmental.entity);
            //next({ response: environmental.entity });
        }
        else{
            session.send("I couldn't find any relevant information :(");
            session.endDialog();
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

bot.add('/TerroristAttack', [
    function (session) {
        builder.Prompts.choice(session, "What about terrorist attacks would you like to learn?", "Summary|How to Prepare|In The Event Of|Possible Outcomes");
    },
    function (session, results) {
        if(results.response.entity == "Summary"){
            session.send("Terrorist attacks like the ones we experienced on September 11, 2001 have left many concerned about the possibility " +
                "of future incidents of terrorism in the United States and their potential impact. They have raised uncertainty about what might " +
                "happen next, increasing stress levels. There are things you can do to prepare for terrorist attacks and reduce the stress that " +
                "you may feel now and later should another emergency arise. Taking preparatory action can reassure you and your children that " +
                "you can exert a measure of control even in the face of such events."
                );
        }
        else if(results.response.entity == "How to Prepare"){
            session.send(
            "Finding out what can happen is the first step. Once you have determined the events possible and their potential in your community, " +
            "it is important that you discuss them with your family or household. Develop a disaster plan together. Also, prepare an emergency kit. The emergency kit" +
            " should be easily accessible should you and your family be forced to shelter in place (stay at home) for a period of time. Be wary of suspicious " +
            "packages and letters. They can contain explosives, chemical or biological agents. Be particularly cautious at your place of employment. "
            );
        }
        else if (results.response.entity == "In The Event Of"){
            session.send(
            "Remain calm and be patient. Follow the advice of local emergency officials. Listen to your radio or television for news and instructions." +
"If the event occurs near you, check for injuries. Give first aid and get help for seriously injured people. If the event occurs near your home while you are there, check for damage using a flashlight. Do not light matches or candles or turn on electrical switches. Check for fires, fire hazards and other household hazards. Sniff for gas leaks, starting at the water heater. If you smell gas or suspect a leak, turn off the main gas valve, open windows, and get everyone outside quickly. " +
"Shut off any other damaged utilities. Confine or secure your pets. Call your family contact—do not use the telephone again unless it is a life-threatening emergency." +
"Check on your neighbors, especially those who are elderly or disabled."
            );
        } else if (results.response.entity == "Possible Outcomes"){
            session.send(
            "As we’ve learned from previous events, the following things can happen after a terrorist attack: " +
"There can be significant numbers of casualties and/or damage to buildings and the infrastructure. So employers need up-to-date information about any medical needs you may have and on how to contact your designated beneficiaries. " +
"Heavy law enforcement involvement at local, state and federal levels follows a terrorist attack due to the event's criminal nature. " +
"Health and mental health resources in the affected communities can be strained to their limits, maybe even overwhelmed. " +
"Extensive media coverage, strong public fear and international implications and consequences can continue for a prolonged period. " +
"Workplaces and schools may be closed, and there may be restrictions on domestic and international travel. " +
"You and your family or household may have to evacuate an area, avoiding roads blocked for your safety. " +
"Clean-up may take many months."
            );
        } 
        session.endDialog();
    } 
]);


bot.add('/Tornado', [
    function (session) {
        builder.Prompts.choice(session, "What about tornados would you like to learn?", "Summary|How to Prepare|Tornado Watch vs. Warning|Danger Signs|During Tornado|After Tornado");
    },
    function (session, results) {
        if(results.response.entity == "Summary"){
            session.send("Continued vigilance and quick response to tornado watches and warnings are critical, since tornadoes can strike virtually" +
                " anywhere at any time. Most tornadoes are abrupt at onset, short-lived and often obscured by rain or darkness. That's why it's so " +
                "important to plan ahead. Every individual, family, and business should have a tornado emergency plan for their homes or places of work, " +
                "and should learn how to protect themselves in cars, open country, and other situations that may arise.");
        }
        else if(results.response.entity == "How to Prepare"){
            session.send(
            "The most important step you can take " +
                "to prepare for a tornado is to have a shelter plan in place. Where will you go when a tornado warning has been issued for your county or city? " +
                "Is it a basement or a storm cellar? Is there an interior room on the ground floor that you can use as a storm shelter? Have a plan, " +
                "and make sure everyone in your family or workplace knows it."
            );
        }
        else if (results.response.entity == "Tornado Watch vs. Warning"){
            session.send(
            "Know the difference between a tornado watch and a warning: Tornado Watch alerts when conditions are right for tornadoes, and tornadoes are " +
            "possible. Remain alert: watch the sky and tune in to NOAA Weather Radio, commercial radio, or a local television station in case a warning " +
            "is issued. Tornado Warnings are when a tornado has been spotted by human eye or radar, and is moving toward you in the warning area. " +
            "Take shelter immediately."
            );
        } else if (results.response.entity == "Danger Signs"){
            session.send(
            "Look for the following danger signs: Dark, greenish sky; Large hail; A large, dark, low-lying cloud (particularly if rotating); " +
            "A loud roar, similar to a freight train; When a tornado warning has been issued for your county or city, seek shelter immediately!"
            );
        } else if (results.response.entity == "During Tornado"){
            session.send(
            "If you are in a structure or residence area, Head to your pre-designated shelter area. This could be a basement, storm cellar, or the " +
            "lowest building level. If you are home and you don't have a basement, go to the most interior room of the ground floor. Often a " +
            "bathroom or laundry room makes a suitable shelter area because the water pipes reenforce the walls, providing a more sturdy structure. " +
            "Stay away from corners, windows, doors, and exterior walls. Put as many walls as possible between you and the outside. Get down on your " +
            "knees and use your hands to protect your head and neck. Do not open windows. If you are outside with no nearby structure, lie flat in a nearby ditch or depression " +
            "and cover your head and neck with your hands. Be aware of flying debris. Tornadoes can pick up large objects and turn them into missiles. Flying debris cause the most tornado deaths."
            );
        } else if (results.response.entity == "After Tornado"){
            session.send(
            "After a tornado passes, it is important to take some precautions. Be careful as your leave your tornado shelter, since there might " +
            "be unseen damage waiting for you on the other side of doors. If your home has been damaged, walk carefully around the outside and check " +
            "for things like loose power lines, gas leaks, and general structural damage. Leave the premises if you smell gas or if floodwaters " +
            "exist around the building. Call your insurance agent and take pictures of the damage to your home or vehicle. If the destruction is " +
            "extensive, don't panic. The American Red Crossand other volunteer agencies will arrive with food and water, and temporary housing will " +
            "be designated by FEMA."
            );
        }   
        session.endDialog();


//
    } 
]);

bot.add('/HeartAttack', [
    function (session) {
        builder.Prompts.choice(session, "What about heart attacks would you like to learn?", "Summary|Symptoms|Emergency|Prevention");
    },
    function (session, results) {
        if(results.response.entity == "Summary"){
            session.send(
            "A heart attack usually occurs when there is blockage in one of the heart's arteries." +
        " This is an emergency that can cause death. It requires quick action. " + 
        "Do not ignore even minor heart attack symptoms. Immediate treatment lessens heart damage and saves lives."
            );
        }
        else if(results.response.entity == "Symptoms"){
            session.send(
            "Common heart attack symptoms and warning signs may include: " +  
            "Chest discomfort that feels like pressure, fullness, or a squeezing pain in the center of your " +
            "chest; it lasts for more than a few minutes, or goes away and comes back. Pain and discomfort that " +
            "extend beyond your chest to other parts of your upper body, such as one or both arms, back, neck, " +
            "stomach,teeth, and jaw. Unexplained shortness of breath, with or without chest discomfort " +
            "Other symptoms, such as cold sweats, nausea or vomiting, lightheadedness, anxiety, indigestion, and " +
            "unexplained fatigue"
            );
        }
        else if (results.response.entity == "Emergency"){
            session.send(
            "If you or someone you are with experiences chest discomfort or other heart attack symptoms, call 911 " +
            "right away. Do not wait more than 5 minutes to make the call. While your first impulse may be to drive " +
            "yourself or the heart attack victim to the hospital, it is better to call 911. Emergency medical services " +
            "(EMS) personnel can begin treatment on the way to the hospital and are trained to revive a person if his " +
            "heart stops. If you witness heart attack symptoms in someone and are unable to reach EMS, drive the " +
            "person to the hospital. If you are experiencing heart attack symptoms, do not drive yourself to the " +
            "hospital unless you have no other choice."
            );
        } else if (results.response.entity == "Prevention"){
            session.send(
            "There are many ways to prevent heart disease. These include quitting smoking, exercising more, and reducing stress. " +
            "Maintaining a healthy and balanced diet is also key."
            );
        }
        session.endDialog();
    } 
]);



dialog.on('SetupUserProfile', [
    function (session) {
        builder.Prompts.text(session, "Welcome!, I'm Viva. Let’s set up your profile.\n\n\n\nIn the case of an emergency, we can communicate your personal information to emergency service operators.\n\n\n\nWhat is your full name?");
    },
    function (session, results) {
        if (results.response == "Crash") 
        {
            session.endDialog();
        }
        session.userData.name = results.response;
        /*if(curData[results.response] !== undefined){
            sender.send('You are already registered');
        }*/
        
        builder.Prompts.text(session, "Hi " + results.response + "\n\n\n\nWhat's your sex?"); 
        
    },
    function (session, results) {
        if (results.response == "Crash") 
        {
            session.endDialog();
        }
        session.userData.sex = results.response;
        builder.Prompts.number(session, "What is your phone number?"); 
    },
    function (session, results) {
        if (results.response == "Crash") 
        {
            session.endDialog();
        }
        session.userData.number = results.response;
        builder.Prompts.text(session, "What is your country?"); 
    },
    function (session, results) {
        if (results.response == "Crash") 
        {
            session.endDialog();
        }
        session.userData.country = results.response;
        builder.Prompts.text(session, "What is your date of birth?"); 
    },
    function (session, results) {
        if (results.response == "Crash") 
        {
            session.endDialog();
        }
        session.userData.DoB = results.response;
        builder.Prompts.text(session, "Do you have any existing medical conditions?");
    },
    function (session, results) {
        if (results.response == "Crash") 
        {
            session.endDialog();
        }
        session.userData.medicalConditions = results.response;
        builder.Prompts.text(session, "Are you allergic to any medications?"); 
    },
    function (session, results) {
        if (results.response == "Crash") 
        {
            session.endDialog();
        }
        session.userData.medicationAllergies = results.response;
        builder.Prompts.text(session, "Last one! What is your health provider?"); 
    },
    function (session, results) {
        if (results.response == "Crash") 
        {
            session.endDialog();
        }
        session.userData.healthProvider = results.response;
        
        myFirebaseRef.child(session.userData.name).set(session.userData);
        country = session.userData.country;
        lastUsedName = session.userData.name;
        session.send("Your profile is set up. Stay safe!");
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






