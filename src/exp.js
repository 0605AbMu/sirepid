var express = require('express');
var util = require('util');

var app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  
  name: "mycookiesession",
  
}));

app.use(function (req, res, next) {
  var views = req.session.views;

  (!views) && (views = req.session.views = {});

  // get the url pathname
  var pathname = req.url;
  console.log(`pathname = ${pathname}`);

  // count the views
  views[pathname] = (views[pathname] || 0) + 1

  next()
})

app.get('/:chuchu', function (req, res, next) {
  console.log(`req.params.chuchu = ${req.params.chuchu}`);
  console.log(`req.session = ${util.inspect(req.session, {depth: null})}`);
  res.send('you viewed this page ' + req.session.views['/'+req.params.chuchu] + ' times')
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})