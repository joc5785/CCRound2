/*jslint node: true */
/*jshint esversion: 6 */
'use strict';
const passport = require('passport');
const config = require('../config');
const logger = require('../logger');
const h = require('../helpers');
//.Strategy brings in the constructor function uses Oauth 2
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = () => {
  //invoked when teh authProcessor function ends, creates session with user.id.  OID from mongo id.
  passport.serializeUser((user, done) => {
    //console.log('In serializeUser'+ user.id);
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    //Find the user using the _id value
    h.findById(id)
      .then(user => done(null, user))
      .catch(error => logger.log('error', 'Error when deserializing the user ' + error));
      //console.log(id);
      //made available in the request stream as req.user
  });


  let authProcessor = (accessToken, refreshToken, profile, done)=> {
    //Find a user in the local db using proifle.id
    //If the user is found, return the user data using done()
    //If the user is not found, create one in the local db and return
    h.findOne(profile.id)
      .then(result =>{
        if(result){
          //console.log('In Auth Processor');
          //gets data out of auth pipeline in to passport
          done(null, result);
        } else {
          //Create a new user
          h.createNewUser(profile)
            .then(newChatUser => done(null, newChatUser))
            .catch(error => logger.log('error', 'Error when creating a new user ' + error));
        }
      });
  };

  //done gets data out of auth process, accessToken and refreshToken are part of Oauth2
  passport.use(new FacebookStrategy(config.fb, authProcessor));
  passport.use(new TwitterStrategy(config.twitter, authProcessor));

};
