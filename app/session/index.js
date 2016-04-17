/*jslint node: true */
/*jshint esversion: 6 */
'use strict';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('../config');
const db = require('../db');

if(process.env.NODE_ENV === 'production'){
  //Init session with settings for production
module.exports = session({
  secret: config.sessionSecret,
  resave: false,
  //stores sessions with out any data or being Init
  saveUnitialized: false,
  store: new MongoStore({
    //db.Mongoose refers to the mongoose connection established in db->index.js connection allows connect-mongo to interface directly, 1 single connection
    mongooseConnection: db.Mongoose.connection
  })
});
} else {
  //Init session with settings for dev
  module.exports = session({
    secret: config.sessionSecret,
    resave: false,
    //stores sessions with out any data or being Init
    saveUnitialized: true
  });
}
