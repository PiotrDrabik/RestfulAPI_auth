const schemas = require('./schemas');
const Authuser = schemas.Authuser;

function userRemove(admCheckArgs) {
    Authuser.remove(admCheckArgs.userId, (err, changeUser) => {
		if(err){
            return admCheckArgs.res.status(503).json({ 'message': err.message });
		}
		admCheckArgs.res.json({
            '_id' : admCheckArgs.userId._id,
            'message' : 'account was deleted'
        });
	});
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
};

function userList(res, query) {
    Authuser.find(query)
        .exec(function (err, users) {
            res.send(users);
        });
};

function userChange(admCheckArgs) {
    Authuser.findOneAndUpdate(admCheckArgs.userId, admCheckArgs.changeUser, {}, (err, changeUser) => {
		if(err){
            return admCheckArgs.res.status(503).json({ 'message': err.message });
		}
		admCheckArgs.res.json(changeUser);
	});
};

function actionDelChange(admCheckArgs) {
    if (admCheckArgs.order==='delete') {
         userRemove(admCheckArgs);
    } else if (admCheckArgs.order==='change') {
         userChange(admCheckArgs);
    }
};

module.exports = {
    userRemove,
    roleCheck,
    userChange,
    actionDelChange,
    userList
}