var sys = require("sys"),
	//os = require('os'),
	pg = require("pg"),
	util = require("util"),
	mu = require("mu2"),
	//md = require("node-markdown").Markdown,
	express = require("express"),
	app = express(),
	http = require("http"),
	server = http.createServer(app);

mu.root = __dirname + "/templates";

var localhost = "localhost";
var port = 8118;

server.listen(port);

app.use("/static", express.static(__dirname + "/static"));
app.use(express.bodyParser());

var conString = "postgres://postgres:postgres@localhost/talkingdata";

var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    return console.error('Could not connect to postgres', err);
  }
});

function render(res, filename) {
	mu.clearCache();
	var stream = mu.compileAndRender(filename, {});	
	util.pump(stream, res);
}

app.get("/", function(req, res) {
	render(res, "index.html");
});


app.get("/client", function(req, res) {
	render(res, "client.html");
});

app.get("/server", function(req, res) {
	render(res, "server.html");
});

app.post('/save', function(req, res) {
    //var name = req.body.name;
    console.log(req.body.name);
    
    var name = req.body.name;
    var svg = req.body.svg;
    var geojson = req.body.geojson;
    
    var values =  + 
      name + "', " + 
      svg + ', ' + 
      name + ', ' + 
      name + ', ' +             
    ');'
    
    client.query("INSERT INTO talkingdata (name, svg, geojson, geom) VALUES ($1)", values, function(err, result) {
      if(handleError(err)) return;
    });
    
    
});