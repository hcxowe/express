var express = require('../../');
var app = module.exports = express();
var users = require('./db');

// 根据不同的预期响应进行处理 Accept
app.get('/', function(req, res){
    // text/html
    res.format({
        html: function(){
          	res.send('<ul>' + users.map(function(user){
        		return '<li>' + user.name + '</li>';
          	}).join('') + '</ul>');
        },

        // text/plain
        text: function(){
          	res.send(users.map(function(user){
            	return ' - ' + user.name + '\n';
          	}).join(''));
        },

        // application/json
        json: function(){
          	res.json(users);
        }
    });
});

function format(path) {
	var obj = require(path);
  	return function(req, res){
    	res.format(obj);
  	};
}

app.get('/users', format('./users'));

/* istanbul ignore next */
if (!module.parent) {
  	app.listen(3000);
  	console.log('Express started on port 3000');
}
