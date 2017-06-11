const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const schemaAuth = new mongoose.Schema({
    nip: {
        type: Number,
        require: true,
        unique: true,
    },
    name: String,
    firstname: String,
    lastname: String,
    phone: Number,
    email: String,
    password: {
        type: String,
        required: true,
        select: false, //exclude password from request ex. Authuser.find
    },
    role: [],
    reg_time: { type: Date, default: Date.now }
});

const Authuser = mongoose.model('Authuser', schemaAuth);

// to deal with unique items (prevent from saving it)
schemaAuth.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });

const roleArgument = {
    id : null, 
    resolve : null, 
    reject : null,
    set : function() {
        roleArgument.id = this.id, 
        roleArgument.resolve = this.resolve, 
        roleArgument.reject = this.reject
    }
};

const admCheckArgs = {
    res : null, 
    userId : null, 
    next : null, 
    id : null, 
    changeUser : null, 
    order : null,
    set : function() {
        admCheckArgs.res = this.res, 
        admCheckArgs.userId = this.userId, 
        admCheckArgs.next = this.next || null,
        admCheckArgs.id = this.id || null,
        admCheckArgs.changeUser = this.changeUser || null, 
        admCheckArgs.order = this.order
    }
};

module.exports = {
    roleArgument,
    admCheckArgs,
    Authuser
}