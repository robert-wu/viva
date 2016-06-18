var builder = require('botbuilder');
var HTTPRequest = require('request');

var bot = new builder.TextBot();
bot.add('/', [
    function (session) {
        builder.Prompts.text(session, "Hello... Give me a country?");
    },
    function (session, results) {
        country= results.response;
        //session.send(country);
        URLBuilder = 'https://restcountries.eu/rest/v1/name/'+ country;

        //console.log(URLBuilder);

        HTTPRequest(URLBuilder, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log(body);
                obj= JSON.parse(body);
                //console.log(obj[0].alpha2Code);
                URLBuilder2 = 'http://emergencynumberapi.com/api/country/'+obj[0].alpha2Code;

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
                        session.send(out.substring(2,200));

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
        console.log(data.code);
    }
]);

bot.listenStdin();