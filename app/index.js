/*jslint node: true */
/*jshint esversion: 6 */
'use strict';
const config = require('./config');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');
//Social Auth logic, invoke the authentication function
require('./auth')();

//create socket io core http server
let ioServer = function(app){
  //global chatrooms array
  app.locals.chatrooms= [];
  const server = require('http').Server(app);
  const io = require('socket.io')(server);
  //set socket io transport to only websocket do not allow long polling
  io.set('transports', ['websocket']);
  //redis publish client
  let pubClient = redis(config.redis.port, config.redis.host, {
    auth_pass: config.redis.password
  });
  //redis subscribing client
  let subClient = redis(config.redis.port, config.redis.host, {
    //returns data in original state
    return_buffers: true,
    auth_pass: config.redis.password
  });
  io.adapter(adapter({
    pubClient,
    subClient
  }));
 //socket io reading from the session
  io.use((socket, next) =>{
    require('./session')(socket.request, {}, next);
  });
  require('./socket')(io, app);
  return server;
};

module.exports = {
  router: require('./routes')(),
  session: require('./session'),
  ioServer,
  logger: require('./logger')
};
