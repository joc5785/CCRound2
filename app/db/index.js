/*jslint node: true */
/*jshint esversion: 6 */
'use strict'
const config = require('../config');
const logger = require('../logger');
const Mongoose = require('mongoose').connect(config.dbURI);

//Log an error if the connetion fails
Mongoose.connection.on('error', error => {
    console.log('Error connecting to mongoose DB');
    logger.log('error', 'Mongoose connection error: ' + error);
});

//Create Schema that defines the structure for storing user data
const chatUser = new Mongoose.Schema({
  profileId: String,
  fullName: String,
  profilePic: String
});

//Turn schema into a usable model
let userModel = Mongoose.model('chatUser', chatUser);


module.exports = {
  Mongoose,
  userModel
};
