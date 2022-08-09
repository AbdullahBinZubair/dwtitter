const mongoo = require('mongoose');

const UserSchecma = new mongoo.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String
    }
});

module.exports = User = mongoo.model('user', UserSchecma);