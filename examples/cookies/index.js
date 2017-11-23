var express = require('../../');
var app = module.exports = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');

// custom log format
if ('test' != process.env.NODE_ENV) {
  app.use(logger(':method :url'));
}

// 签名cookie 
app.use(cookieParser('my secret here'));

// 表单解析 x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

app.get('/', function (req, res) {
  if (req.cookies.remember) {
    res.send('Remembered :). Click to <a href="/forget">forget</a>!.');
  } else {
    res.send('<form method="post"><p>Check to <label>'
      + '<input type="checkbox" name="remember"/> remember me</label> '
      + '<input type="submit" value="Submit"/>.</p></form>');
  }
});

app.get('/forget', function (req, res) {
  res.clearCookie('remember');
  res.redirect('back'); // 应该是重定向到上一次的url
});

app.post('/', function (req, res) {
  var minute = 60000;
  if (req.body.remember) res.cookie('remember', 1, { maxAge: minute });
  res.redirect('back');
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
