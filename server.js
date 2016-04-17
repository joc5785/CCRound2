'use strict';
const express = require('express');
const app = express();
const chatCat = require('./app');
const passport = require('passport');

app.set('port', process.env.PORT || 3000);
//app.set('views', './views');  Not needed as Express assumes dynamic views are in a view folders
app.use(express.static('public'));
app.use(express.static('node_modules/babel-standalond'));
app.set('view engine', 'ejs');

//has to appear before router is mounted or sessions will not be available
app.use(chatCat.session);
//hooks up passport to request and response streams that express makes avaiable
app.use(passport.initialize());
//ability to write and read from the sessions
app.use(passport.session());
app.use(require('morgan')('combined', {
  stream: {
    write: function(message){
      //write to logs
      chatCat.logger.log('info', message);
    }
  }
}));

app.use('/', chatCat.router);

chatCat.ioServer(app).listen(app.get('port'), function(){
  console.log('ChatCat listening on Port ', app.get('port'));
})
