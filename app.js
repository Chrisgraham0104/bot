
var restify = require('restify');
var builder = require('botbuilder');

console.log (process.env);
// Setup Restify Server
var server = restify.createServer();

var header = {'Content-Type':'application/json', 
'Ocp-Apim-Subscription-Key':'6fb7959510a84e389985fd3343705e6b'};

console.log (server);
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    //session.send("You said: %s", session.message.text);
    console.log("hi");
    bot.dialog('/happy', [    
        function(session) {    
            console.log('1');
        builder.Prompts.text(session, "That's awesome! What would make you even happier?");    
        },    
        function(session, results) { 
            console.log('2');
             getGiphy(results.response).then(function(gif) {  
              session.send(gif.toString());      
             console.log('console data -->' + JSON.parse(gif).data);   
             session.send({                
                text: "Here you go!",                
                attachments: [                    
                   {                        
                      contentType: 'image/gif',     
                      contentUrl: 
                        JSON.parse(gif).data.images.original.url  
                   }                
                ]            
             });        
        }).catch(function(err) {            
              console.log("Error getting giphy: " + err);  
              session.send({                
                 text: "We couldn't find that unfortunately :(",
                 attachments: [                    
                   {                        
                      contentType: 'image/gif',  
                      contentUrl: 'https://media.giphy.com/media/ToMjGpt4q1nF76cJP9K/giphy.gif',  
                      name: 'Chicken nugz are life'   
                   }                
                 ]            
               });        
           }).then(function(idk) {     
              builder.Prompts.text(session, "Would you like to see more?");        
           });    
        },    
        function (session, results) {        
            console.log('3');
           if (results.response === "Yes" || results.response ===
           "yes") {            
             session.beginDialog('/giphy');        
           } else {            
             session.endDialog("Have a great rest of your day!!!");           
          }    
        }
     ]);
});

bot.on('conversationUpdate', function (message) {    
    if (message.membersAdded[0].id === message.address.bot.id) {             
          var reply = new builder.Message()    
                .address(message.address)    
                .text("Hello, I'm careBOTyou! How's your day going?");        
          bot.send(reply);    
    }
 }); 





function sendGetSentimentRequest(message) {      
   var options = {        
      method: 'POST',        
      uri:'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',        
      body: {            
         documents:[{id:'1', language: 'en', text:message}]  
      },        
      json: true, // Automatically stringifies the body to JSON
      headers: header    
   };    
   return rp(options)
;}
function getGiphy(searchString) {    
   var options = {        
      method: 'GET',        
      uri: 'https://api.giphy.com/v1/gifs/translate',        
      qs: {            
         s: searchString,            
         api_key: '9n8AIaWULVu37sA1k8eE38IwnCCjmXP9'        
      }    
   }    
   return rp(options)
;}