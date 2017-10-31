/**
 * 模块依赖
 */

var express = require('../..');
var path = require('path');

/**
 * 验证密码模块
 * 根据密码可以生成salt与hash，然后根据传入的password跟salt可以生成hash，经过hash的对比进行登录验证
 */
var hash = require('pbkdf2-password')();

/**
 * 会话存储
 * 帮你管理客户端cookie与session的对应关系
 */
var session = require('express-session');

var app = module.exports = express();

// 配置模版引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件，表单参数解析
app.use(express.urlencoded({ extended: false }))
app.use(session({
    resave: false, // 没有改变重新保存会话
    saveUninitialized: false, // 在没有东西存储之前不要创建会话
    secret: 'shhhh, very secret'
}));

// Session-persisted message middleware
app.use(function (req, res, next) {
    var err = req.session.error;
    var msg = req.session.success;

    delete req.session.error;
    delete req.session.success;
    
    res.locals.message = '';
    if (err) {
        res.locals.message = '<p class="msg error">' + err + '</p>';
    }

    if (msg) {
        res.locals.message = '<p class="msg success">' + msg + '</p>';
    }

    next();
});

// 虚拟数据库
var users = {
    tj: { name: 'tj' }
};

// 当你创建一个用户，为password生成salt和hash
hash({ password: 'foobar' }, function (err, pass, salt, hash) {
    if (err) {
        throw err;
    }

    // 存储
    users.tj.salt = salt;
    users.tj.hash = hash;

    console.dir(users);
});


// 使用我们创建的普通对象进行密码验证
function authenticate(name, pass, fn) {
    if (!module.parent) {
        console.log('authenticating %s:%s', name, pass);
    }

    var user = users[name];
    
    if (!user) {
        return fn(new Error('cannot find user'));
    }

    // password验证
    hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
        if (err) {
            return fn(err);
        }

        if (hash == user.hash) {
            return fn(null, user);
        }

        fn(new Error('invalid password'));
    });
}

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } 
    else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

app.get('/', function(req, res){
    res.redirect('/login');
});

app.get('/restricted', restrict, function(req, res){
    res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});

app.get('/logout', function(req, res){
    // 销毁session
    req.session.destroy(function(){
        res.redirect('/');
    });
});

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', function(req, res){
    authenticate(req.body.username, req.body.password, function(err, user){
        if (user) {
          req.session.regenerate(function(){
            req.session.user = user;
            req.session.success = 'Authenticated as ' + user.name
              + ' click to <a href="/logout">logout</a>. '
              + ' You may now access <a href="/restricted">/restricted</a>.';
            res.redirect('back');
          });
        } else {
          req.session.error = 'Authentication failed, please check your '
            + ' username and password.'
            + ' (use "tj" and "foobar")';
          res.redirect('/login');
        }
    });
});

/* istanbul ignore next */
if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}
