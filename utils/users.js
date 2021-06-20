const users = [];

//join user to chat
function userJoin(id, username, room) {
    let user = {id, username, room};
    users.push(user);
    return user;
}

// Get the current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// User leaves the chat
function leaveUser(id) {
    for(let i = 0; i < users.length; i++) {
        if(users[i].id == id) {
            return users.splice(i, 1)[0];
        }
    }
}

//Get the users in particular room

function getRoomUsers(room) {
    return users.filter(user => user.room == room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    leaveUser,
    getRoomUsers
};