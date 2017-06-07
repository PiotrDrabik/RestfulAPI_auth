const express = require('express');
const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const routerUser = express.Router();
var bcrypt = require('bcrypt');
const saltRounds = 10;

var jwt = require('jsonwebtoken');
var passport = require('passport');
var passportJWT = require('passport-jwt');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

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

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = require('./~key/key.json').key;
var expirationTime = '2h'; //eg: 1d, 10h, 20m, doc: https://www.npmjs.com/package/jsonwebtoken

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, done) {
    Authuser.findOne({ '_id': jwt_payload._id }, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
});

passport.use(strategy);

// login user
routerUser.post('/login', loginUser);

function loginUser(req, res, next) {
    Authuser.findOne({ 'nip': req.body.nip })
        .select('password')
        .exec(function (err, cbauth) {
            const fnCallbackArguments = {
                error : err,
                hashedPass : cbauth, // hashed pass and id
                plainPass : req.body.password, // user's password from form
                res : res
            };
            fnCallback(fnCallbackArguments);
        });
    return res;
};

function fnCallback(args) {
    if (!args.hashedPass) {
        return args.res.status(401).json({ 'message': 'no such user' });
    }
    if (args.error) {
        return args.res.status(503).json({ 'message': args.error.message });
    } 
    bcrypt.compare(args.plainPass, args.hashedPass.password, function (error, response) {
        const passCheckArguments = {
            error : error,
            response : response, // response boolean
            idAuth : args.hashedPass._id, // user id
            res : args.res
        };
        passCheck(passCheckArguments);
   })
};

function passCheck(args) {
    if (args.error) {
        return args.res.status(503).json({ 'message': args.error.message });
    } else {
        if (args.response) {
            var payload = { _id: args.idAuth };
            var token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: expirationTime });
            // will return json and status 200
            return args.res.json({ 'token': token });
        } else {
            return args.res.status(401).json({ 'message': 'wrong password' });
        }
    }
};

// get user data
routerUser.get('/users', passport.authenticate('jwt', { session: false }), getUsers);

function getUsers(req, res, next) {
    let token = req.get('Authorization');
    var decoded = jwt.verify(token.substring(4, token.length), jwtOptions.secretOrKey);
    new Promise((resolve, reject) => {
        const roleArgument = {
            id : decoded._id, 
            resolve : resolve, 
            reject : reject
        }
        roleCheck(roleArgument)
    }).then((resolve) => {
        let query = checkQueryAdmin(resolve, decoded._id);
        userList(res, query);
    }).catch((reject) => {
        promiseProblem(reject,res);
    });
};

function checkQueryAdmin(query, id) {
    let responseQuery;
    if (query==='admin') {
        responseQuery = {}; // admin can see entire database
    } else {
        responseQuery = {'_id' : id}; // user will see only own data
    }
    return responseQuery;
}

function promiseProblem(reject, res) {
    console.log('Handle rejected promise ('+reject+') here.');
    return res.status(500).json({ 'message': 'problem with permissions' });
};

function roleCheck(roleArgument) {
    Authuser.findOne({ '_id': roleArgument.id }, function (err, user) {
        if (err) {
            roleArgument.reject(err, false);
        }
        if (user) {
            roleArgument.resolve(returnRoleName(user.role));
        }
    });
};

function returnRoleName(roleArray) {
    let role = '';
    roleArray.forEach((element, index, array) => {
    if (element === 'admin') {
        role = 'admin';
    } else {
         role = (role!=='') ? role : element;
        }
    });
    return role;
}

function userList(res, query) {
    Authuser.find(query)
        .exec(function (err, users) {
            res.send(users);
        });
};

// new user
routerUser.post('/user', passport.authenticate('jwt', { session: false }), postUser);

function postUser(req, res) {
    var userdata = new Authuser(req.body);
    if ((userdata.nip === null) || (userdata.nip === undefined) || (userdata.password === null) || (userdata.password === undefined)) {
        return res.status(400).json({'message': 'NIP and Password musn\'t be empty'});
    }
    bcrypt.hash(userdata.password, saltRounds, function (err, hash) {
        if (err) {
            return res.status(503).json({ 'message': err.message });
        } else {
            userdata.password = hash;
            saveNewUser(userdata, res)   
        }
    });
};

function saveNewUser(userdata, res) {
    userdata.save(userdata, (err, authusr) => {
        if (err) {
            return res.status(400).json({ 'message': err });
        } else {
            return res.json(authusr);
        }
    });    
}

// put (change) user data
routerUser.put("/user/:userid", passport.authenticate('jwt', { session: false }), putUser);

function putUser(req, res, next) {
    let userId = {'_id': req.params.userid};
    let changeUser = req.body;
    let token = req.get('Authorization');
    let decoded = jwt.verify(token.substring(4, token.length), jwtOptions.secretOrKey);
    if (userId === {}) {
        return res.status(400).json({ 'message': 'empty query /user/:userid' });
    }
    if (JSON.stringify(changeUser) === JSON.stringify({})) {
        return res.status(400).json({ 'message': 'empty body, no data to change'});
    }
    // user is trying to change it's own data
    if (userId._id === decoded._id) {
        userChange(res, userId, changeUser);
    }
    // user is trying to change someone else's data
    if (userId._id !== decoded._id) {
        admCheckArgs = {
            res : res, 
            userId : userId, 
            next : next, 
            id : decoded._id, 
            changeUser : changeUser, 
            order : 'change'
        }
        adminCheck(admCheckArgs)
    }
};

function adminCheck(admArgs) {
    new Promise((resolve, reject) => {
            const roleArgument = {
                id : admArgs.id, 
                resolve : resolve, 
                reject : reject
            }
            roleCheck(roleArgument)
        }).then((resolve) => {
            if (resolve==='admin') {
                if (admArgs.order==='delete') {
                    userRemove(admArgs.res, admArgs.userId);
                } else if (admArgs.order==='change') {
                    userChange(admArgs.res, admArgs.userId, admArgs.changeUser ? admArgs.changeUser : {});
                }
            } else {
                return admArgs.res.status(401).json({ 'message': 'Only admin can change this data'});
            }
        }).catch((reject) => {
        promiseProblem(reject, admArgs.res);
    });    
}

function userChange(res, userId, changeUser) {
    Authuser.findOneAndUpdate(userId, changeUser, {}, (err, changeUser) => {
		if(err){
            return res.status(503).json({ 'message': err.message });
		}
		res.json(changeUser);
	});
};

routerUser.delete('/user/:userid', passport.authenticate('jwt', { session: false }), deleteUser);

function deleteUser(req, res, next) {
    var userId = {'_id': req.params.userid};
    let token = req.get('Authorization');
    var decoded = jwt.verify(token.substring(4, token.length), jwtOptions.secretOrKey);
    if (userId=={}) {
        return res.status(400).json({ 'message': 'empty query /user/:userid' });
    }
    // user is trying to change it's own data
    if (userId._id === decoded._id) {
        userRemove(res, userId);
    }
    // user is trying to change someone else's data
    if (userId._id !== decoded._id) {
        admCheckArgs = {
            res : res, 
            userId : userId, 
            next : next, 
            id : decoded._id, 
            order : 'delete'
        }
        adminCheck(admCheckArgs)
    }
}; 

function userRemove(res, userId) {
    Authuser.remove(userId, (err, changeUser) => {
		if(err){
            return res.status(503).json({ 'message': err.message });
		}
		res.json({
            '_id' : userId._id,
            'message' : 'account was deleted'
        });
	});
};

module.exports = routerUser;