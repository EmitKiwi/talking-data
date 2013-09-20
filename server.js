var sys = require("sys"),
	os = require('os'),
	pg = require("pg"),
	util = require("util"),
	mu = require("mu2"),
	md = require("node-markdown").Markdown,
	express = require("express"),
	app = express(),
	http = require("http"),
	server = http.createServer(app);

mu.root = __dirname + "/templates";

var localhost = "localhost";
var port = 8118;


server.listen(port);

app.use("/static", express.static(__dirname + "/static"));

function render(res, filename) {
	mu.clearCache();
	var stream = mu.compileAndRender(filename, {});	
	util.pump(stream, res);
}

app.get("/", function(req, res) {
	render(res, "index.html");
});

app.post("/save", function(req, res) {
	render(res, "index.html");
});


app.get("/client", function(req, res) {
	render(res, "client.html");
});

app.get("/server", function(req, res) {
	render(res, "server.html");
});

