var express = require('express');
var app = express();

app.set('port', 3000);

app.get('/', (req, res) => {
  res.send('Node API is up and running on port 3000...\n');
});

var server = app.listen(app.get('port'), function () {
  var port = server.address().port;
  console.log("api on port" + port);
});
