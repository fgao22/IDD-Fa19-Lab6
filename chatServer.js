/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

const {Translate} = require('@google-cloud/translate');

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;
const translate = new Translate();



//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hey, hello I am ChiBot - a simple chat bot."); //We start with the introduction;
    setTimeout(timedQuestion, 5000, socket, "What is your name?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});

async function translateText(text, target) {
	const {Translate} = require('@google-cloud/translate');
	const translate = new Translate();
	let [translations] = await translate.translate(text, target);
	console.log('Translations:');
	console.log(`Translation: ${translation}`);
}





//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    answer = 'Hello ' + input + ' :-)'; // output response
    waitTime = 5000;
    question = 'What is your favorite class?'; // load next question
  } else if (questionNum == 1) {
    answer = input + ' is not. Your favorite class is Interactive Device Design.'; // output response
    waitTime = 5000;
    question = 'Do you know how to program?'; // load next question
  } else if (questionNum == 2) {
    answer = input + '? You sure?';
    waitTime = 5000;
    question = '1 + 1 = ?'; // load next question
  } else if (questionNum == 3) {
    answer = 'Ok... ' + input + '... The answer is 10 coz it is in binary.';
    socket.emit('changeBG', input.toLowerCase());
    waitTime = 5000;
    question = 'Are you this bored to still play this game?'; // load next question
  } else if (questionNum == 4) {
    if (input.toLowerCase() === 'yes' || input === 1) {
      answer = 'Get a life!';
      waitTime = 5000;
      question = 'What is the best programming language?';
    } else if (input.toLowerCase() === 'no' || input === 0) {
      answer = 'But you are.'
      waitTime = 0;
      questionNum--; // Here we go back in the question number this can end up in a loop
    } else {
      question = 'Can you still read the font?'; // load next question
      answer = 'I did not understand you. Could you please answer "yes" or "no"?'
      questionNum--;
      waitTime = 5000;
    }
    // load next question
  } else {
    answer = 'I have nothing more to say!'; // output response
    waitTime = 0;
    question = '';
  }


  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
