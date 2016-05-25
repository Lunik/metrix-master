var Config = require('../config/config.json')
var Scrape = require('./scrape.js')

var express = require('express')
var http = require('http')
var fs = require('fs')

http.globalAgent.maxSockets = Infinity

app = express()
app.use(express.static(__dirname+"/public"))

server = http.createServer(app)
var port = process.env.PORT || Config.webConsole.port
server.listen(port, function () {
    console.log('Server listening at port ' + port)
})

app.get('/scrape.json', function(req, res){
  res.end(JSON.stringify(Scrape))
})

app.get('/jquery.js', function(req, res){
  fs.readFile(__dirname+"/../node_modules/jquery/dist/jquery.min.js", function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})

app.get('/chart.js', function(req, res){
  fs.readFile(__dirname+"/../node_modules/chart.js/dist/Chart.min.js", function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})
