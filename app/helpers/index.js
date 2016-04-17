/*jslint node: true */
/*jshint esversion: 6 */
'use strict';
const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

//_ to denote this is a private method
let _registerRoutes = (routes, method) => {
  for(let key in routes){
    if(typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)){
      _registerRoutes(routes[key], key);
    } else {
      //Regiser the routes
      if(method === 'get'){
        router.get(key, routes[key]);
      } else if(method === 'post'){
        router.post(key, routes[key]);
      }else {
        router.use(routes[key]);
      }
    }
  }
};

let route = function(routes){
    _registerRoutes(routes);
    return router;
};

//Function to find a single user based on a key
let findOne = profileID =>{
  return db.userModel.findOne({
      'profileId': profileID
  });
};

//Creat a new user and return that instance
let createNewUser = profile => {
  return new Promise(function(resolve, reject){
      let newChatUser = new db.userModel({
        profileId: profile.id,
        fullName: profile.displayName,
        profilePic: profile.photos[0].value ||''
      });
      newChatUser.save(error =>{
        if(error){
          reject(error);
        } else{
            resolve(newChatUser);
        }
      });
  });
};

//The ES6 promisified version of findByID
let findById = function(id){
  //console.log('In findById');
  return new Promise((resolve, reject) => {
    db.userModel.findById(id,(error, user) => {
      if(error){
        reject(error);
      } else {
        //console.log("Find By id is success");
        resolve(user);
      }
    });
  });
};

let isAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()){
      next();
  } else {
    res.redirect('/');
  }
};

//search allrooms array with the room name
let findRoomByName = function(allrooms, room){
  //findIndex iterates over the allrooms array and returns element, index, and array
  let findRoom = allrooms.findIndex((element, index, array) => {
    //if the element matches the room value return true
    if(element.room === room){
      return true;
    } else {
      return false;
    }
  });
  //findRoom is set to the index number of the arry if a match exists or -1 if it does not
  return findRoom > -1 ? true : false;
};

//A function that generates a new room ID
let randomHex = () => {
  return crypto.randomBytes(24).toString('hex');
};

//find a chatroom with a given ID
let findRoomById = (allrooms, roomID) =>{
  return allrooms.find((element, index, array) => {
    if(element.roomID === roomID){
      return true;
    } else {
      return false;
    }
  });
};

let addUserToRoom = function(allrooms, data, socket){
  console.log('addUserToRoom method');
  console.log('Room ID ' + data.roomID);
  //get the room object
  let getRoom = findRoomById(allrooms, data.roomID);
  console.log('getRoom ' + getRoom);
  if(getRoom !== undefined){
    // Get teh active user's ID (ObjectID as used in the session), similar to req.user
    let userID = socket.request.session.passport.user;
    //check to see if this user already exists in the chatroom user index
    let checkUser = getRoom.users.findIndex(function(element, index, array){
      if(element.userID === userID){
        console.log("check user True");
        return true;
      } else {
        console.log("check user false");
        return false;
      }
    });
    //if the user is already present in the room remove him first
    //checkUser will resolve to the index number of the user in the array
    //splice method is remvoing the record at the index number in the array
    if(checkUser > -1){
      getRoom.users.splice(checkUser, 1);
    }
    //push the user in to the array
    getRoom.users.push({
      socketID: socket.id,
      userID,
      user: data.user,
      userPic: data.userPic
    });
    //Join the room channel
    socket.join(data.roomID);
    return getRoom;
  }
};

let removeUserFromRoom = function(allrooms, socket){
  //loop through all rooms in array
  for(let room of allrooms){
    //Find the user in the list of users in each room in array
    let findUser = room.users.findIndex((element, index, array) => {
      if(element.socketID === socket.id){
        return true;
      }else {
        return false;
      }
  });
  if(findUser> -1){
    socket.leave(room.roomID);
    room.users.splice(findUser,1);
    return room;
  }
}
}

module.exports = {
  route,
  findOne,
  createNewUser,
  findById,
  isAuthenticated,
  findRoomByName,
  randomHex,
  findRoomById,
  addUserToRoom,
  removeUserFromRoom
};
