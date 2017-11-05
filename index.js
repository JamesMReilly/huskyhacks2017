'use strict'

//dependency
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var mysql = require('mysql');

var con = mysql.createConnection({
  host     : 'db4free.net',
  port     : '3307',
  user     : 'management',
  password : 'workerdata',
  database : 'workerdata'
});

//initialize your app
const app = express()
//   var wit = require('./service/wit').getWit()


//two secret variables that you cannot let anyone know
const token = process.env.FB_VERIFY_TOKEN
const access = process.env.FB_ACCESS_TOKEN

app.set('port',(process.env.PORT) || 5000)

//allow us to process the data
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//Facebook security
app.get('/webhook/',function(req,res){
  if(req.query['hub.verify_token'] === token){
      res.send(req.query['hub.challenge'])
  }
  res.send("Wrong token")
})



var read = function(sender, message, reply){
  if(message === 'hello'){
    //reply back hello
    message = "Hello there. How are you doing?"
    reply(sender,messege)
  }else{
    //find the user
    var sessionId = findOrCreateSession(sender)
    //fotward the message to Wit.ai bot engine.
    wit.runActions(
      sessionId, //the user's current session by id
      message, // the user's message
      sessions[sessionId].context, //the user's session state
      function (error, context){
        if(error){
          console.log('oops!',error)
        }else{
          //wit ran all the actions, now it needs more messages
          console.log('Waiting for further messages')
          sessions[sessionId].context = context
        }
      }
    )
  }
}


app.post('/webhook/',function(req,res){
  let messaging_events = req.body.entry[0].messaging
  for(let i = 0; i < messaging_events.length; i++){
    let event = messaging_events[i]
    let sender = event.sender.id
    if(event.message && event.message.text){
      let text = event.message.text
      decideMessage(sender, text)
    }
    if(event.postback){
      let text = JSON.stringify(event.postback)
      decideMessage(sender, text)
      continue
    }
  }
  res.sendStatus(200)
})

function decideMessage(sender, text1){
  let text = text1.toLowerCase()
  if(text.includes("physical")){
    var randomNumber = Math.floor(Math.random() * 12) + 1
    console.log(randomNumber)
    sendText(sender, exerciseArray[randomNumber]);
    sendText(sender, exerciseDiscription[randomNumber])
    sendImageMessage(sender, exerciseImgURL[randomNumber])
    sendButtonMessage(sender, "If you did the exercise, come back and click the yes button after you are done! ")
  }else if (text.includes("yes")){
    sendText(sender,"Good job! I will send you another update later!")
    console.log("hello")
    sendImageMessage(sender, "https://media.tenor.com/images/2a03935831a358383cdf57d0f03206f3/tenor.gif")
    setTimeout(function(){
      sendText(sender,"Hello again!");
    },3000000)
  }else if(text.includes("no")){
    sendText(sender,"No Worries! I will send you another one the next time you are free!")
    console.log("hello")
    sendImageMessage(sender,"https://78.media.tumblr.com/1da661d17a6d4d8f7d4f1b01596bf0d6/tumblr_o5flbpgYdE1tvyk2ao1_500.gif" )
  }else if(text.includes("mental")){
    var randomNum = Math.floor(Math.random() * 4) + 1
    console.log(randomNum)
    sendText(sender, mentalExerciseDiscription[randomNum])
  }else if(text.includes("subscribe")){
    sendText(sender, "Hi there! Thanks for subscribing!My goal is to try helping you live a healthier life by doing some short physical or mental exercise")
    console.log("hello")
    sendText(sender, "I will be reminding you to exercise throughout the day! Simply type 'physical' and I will give you some recommendations of short physical exercise you can do. If you want to do short mental exercise, simply type: 'mental'")
    sendImageMessage(sender, "https://petsittersireland.com/wp-content/uploads/2014/06/Dog-Exercise.jpg")
  }else{
    sendText(sender, "I am not a fully functional bot yet")
    sendText(sender, "Please enter 'physical' for a pyshical exercise or 'mental' for mental exercise")
  }
}

function sendOneButtonMessage(sender, intent1){
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "buttons":[
          {
            "type":"postback",
            "title": "Answer",
            "payload":"Answer"
          },
        ]
      }
    }
  }
  sendRequest(sender,messageData)
}
function sendGenericMessage(sender, subtitle, imgURL, buttonURL){
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Do this exercise for 5 minutes",
            "image_url":imgURL,
            "subtitle":subtitle,
            "buttons":[
              {
                "type":"web_url",
                "url": buttonURL,
                "title":"I would like to know more"
              }
            ]
          }
        ]
      }
    }

  }
  sendRequest(sender,messageData)
}


function sendButtonMessage(sender, text){
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":text,
        "buttons":[
          {
            "type":"postback",
            "title":"Yes",
            "payload":"Yes, I did"
          },
          {
            "type":"postback",
            "title":"No",
            "payload":"No, I did not"
          }
        ]
      }
    }
  }
  sendRequest(sender,messageData)
}


function sendImageMessage(sender,url){
  let messageData = {
    "attachment":{
    "type":"image",
    "payload":{
      "url": url
      }
    }
  }
  sendRequest(sender,messageData)
}

function sendText(sender, text) {
	let messageData = {text: text}
	sendRequest(sender,messageData)
}

function sendRequest(sender, messageData){
  request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: access},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

//start the server and listen to request
app.listen(app.get('port'),function(){
  console.log("running: port")
})


//some helper function
var exerciseArray  = {
  1: "Exercise: Raise The Roof(20 reps)",
  2: "Exercise: Triceps kick (20 reps)",
  3: "Exercise: The Hulk (20 reps)",
  4: "Exercise: Hamstring curl (20 reps)",
  5: "Exercise: Knee lift (20 reps)",
  6: "Exercise: Hallelujah (20 reps)",
  7: "Exercise: Punching (20 reps)",
  8: "Exercise: Desk pushup(10 reps)",
  9: "Exercise: Side lunge (10 per side)",
  10: "Exercise: Jump squats (10 reps)",
  11: "Exercise: Chair dips (10 reps)",
  12: "Exercise: Walking(10 min.)"
}

var exerciseDiscription = {
  1:"Instruction: While marching in place, push toward the ceiling with your palms up and thumbs almost touching your shoulders. Make it harder by holding water bottles." ,
  2:"Instruction: While marching in place, bend at the hips, about 45 degrees. Bend your elbows, then extend them behind you as if you are lifting weights.",
  3:"Instruction: Keep marching and leaning. With your elbows bent and fists together in front, move your arms back like wings. Try to touch your shoulder blades together.",
  4:"Instruction: Bend arms at the elbow. Bring one foot up toward your rear end while straightening your arms so that your hands are down when your foot is up.",
  5: "Instruction: Just like hamstring curls, except you lift your knee up in front as your arms go down.",
  6: "Instruction: Sweep arms above your head and down again as you step side-to-side. Actually yelling ''Hallelujah!'' is optional.",
  7: "Instruction: While rocking foot to foot, punch with alternating arms. To reduce elbow stress, try not to fully straighten your arm.",
  8: "Instruction: Place hands on edge of desk, shoulder width apart, legs out behind you. Push off with as much force as you can.",
  9: "Instruction: Place hands on edge of desk, shoulder width apart, legs out behind you. Push off with as much force as you can.",
  10: "Instruction: Make sure you have space in front of you. Bend into a half-squat with your arms behind you, then jump and swing your arms up as if you're celebrating.",
  11: "Instruction: With your legs out in front of you, grab the edge of a chair (or desk) and lift yourself down and back up. At the end, you'll be conveniently back in your seat.",
  12: "Instruction: Lap your block or a floor of your office. Try for a pace of 100 steps per minute, which is easy if you don't stop to play with tchotchkes on other people's desks.",
}

var exerciseImgURL = {
  1: "https://media.giphy.com/media/xT0xeBL3abZRfyKF7q/giphy.gif",
  2: "https://media.giphy.com/media/l2QE3V3LEOc93Rhyo/giphy.gif",
  3: "https://media.giphy.com/media/3ohs814I5RYMaZUZGg/giphy.gif",
  4: "https://media.giphy.com/media/xUOxf7QSk46jqKZLfG/giphy.gif",
  5: "https://media.giphy.com/media/xUOxeQcPBXi5xsgTMA/giphy.gif",
  6: "https://media.giphy.com/media/3ohs7VWuFCvK8uGiha/giphy.gif",
  7: "https://media.giphy.com/media/xUOxf9wCKM5pyToM4o/giphy.gif",
  8: "https://media.giphy.com/media/xUOxfiPOlSVJF3gtKo/giphy.gif",
  9: "https://media.giphy.com/media/xUOxfh3Kmpv5kejPQk/giphy.gif",
  10:"https://media.giphy.com/media/xUOxfaPncPTxQXk4M0/giphy.gif",
  11:"https://media.giphy.com/media/3o6fIW1eU4QY8S4Tss/giphy.gif",
  12:"https://media.giphy.com/media/3o6fJgnvOiXkkg20p2/giphy.gif",

}


var mentalExerciseDiscription = {
  1: "Exercise: Sound Series Pattern. Can you figure out the logic I used to decide the order of the following words: gun, shoe, spree, door, hive, kicks, heaven, gate, line, den?",
  2: "Exercise: October Train Puzzle. An express train takes 3 seconds to enter tunnel which is 1 km long. If it is traveling at 120 km an hour, how long will it take to pass completely through the tunnel",
  3: "Exercise: Salman Age Puzzle. Salman's youth lasted one sixth of his life. He grew a beard after one twelfth more. After one seventh more of his life, he married. 5 years later, he and his wife had a son. The son lived exactly one half as long as his father, and salman died four years after his son.\n How many years did salman live?",
  4: "Exercise: Distance Puzzle. Two friends decide to get together; so they start riding bikes towards each other. They plan to meet halfway. Each is riding at 6 MPH. They live 36 miles apart. One of them has a pet carrier pigeon and it starts flying the instant the friends start traveling. The pigeon flies back and forth at 18 MPH between the 2 friends until the friends meet. How many miles does the pigeon travel?",
}
var mentalExerciseAnswer = {
  1: "Each word rhymes with its numeric position in the list. (e.g. 'gun' rhymes with 'one', etc.)",
  2: "The train takes 30 seconds to travel 1 km, plus 3 seconds for the complete train to pass any point, making a total of 33 seconds.",
  3: "The riddle, the 'facts' of which may or may not be true, results in the following equation: /n x/6 + x/12 + x/7 + 5 + x/2 + 4 = x /nwhere x is salman's age at the time of his death./nTherefore, salmna lived exactly 84 years.",
  4: "54. It takes 3 hours for the friends to meet; so the pigeon flies for 3 hours at 18 MPH = 54 miles",
}
