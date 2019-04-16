var express = require('express');
//var db = require('./db.js');
var app = express();
var router = express.Router();

router.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/scripts'));
app.use(express.static(__dirname + '/styles'));
app.use(express.static(__dirname + '/views/images'));
app.use('/', router);
var listener = app.listen(process.env.PORT || 8080, function () {
   console.log('Your app is listening on port ' + listener.address().port);
});
