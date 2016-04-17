/*jslint node: true */
/*jshint esversion: 6 */
'use strict';
const h = require('../helpers');

module.exports = function(io, app){
  let allrooms = app.locals.chatrooms;

  io.of('/roomslist').on('connection', function(socket){
    socket.on('getChatrooms', function(){
      socket.emit('chatroomsList', JSON.stringify(allrooms));
    });
    socket.on('createNewRoom', newRoomInput => {
      //console.log(newRoomInput);
      //check to see if a room with the same title exists
      //if not create new room and broadcast it back to everyone
      //if findRoomByName returns a false
      if(!h.findRoomByName(allrooms, newRoomInput)){
        //console.log('In create new room and find room by name if statement');
        allrooms.push({
          room: newRoomInput,
          roomID: h.randomHex(),
          users: []
        });
        //let allroomsOutput = JSON.stringify(allrooms);
        //console.log('allrooms ' + allroomsOutput);
        //Emit an update list to only creator
        socket.emit('chatroomsList', JSON.stringify(allrooms));
        //emit an update to all users on rooms page
        socket.broadcast.emit('chatroomsList', JSON.stringify(allrooms));
      }
    });
  });

  io.of('chatter').on('connection', socket => {
    socket.on('join', function(data){
      let userList = h.addUserToRoom(allrooms, data, socket);
      //update the list of active users as shown on the chatroom page
      //Broadcast updated user list to all people in that chatroom
      socket.broadcast.to(data.roomID).emit('updateUserList', JSON.stringify(userList.users));
      //Emit user list to the user who has joined the chatroom
      socket.emit('updateUserList', JSON.stringify(userList.users));
    });

    //When a socket(user) exits the room
    socket.on('disconnect', () => {
        //Find the rooms which socket was present and purge the user
        let room = h.removeUserFromRoom(allrooms, socket);
        socket.broadcast.to(room.roomID).emit('updateUserList', JSON.stringify(room.users));
    });

    //when a new message arrives
    socket.on('newMessage', data => {
      socket.to(data.roomID).emit('inMessage', JSON.stringify(data));
    });
  });
};
