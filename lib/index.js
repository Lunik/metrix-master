var Config = require('../config/config.json')
var Scrape = require('./scrape.js')

var express = require('express')
var http = require('http')
var fs = require('fs')

http.globalAgent.maxSockets = Infinity

app = express()
app.use(express.static(__dirname + '/public'))

server = http.createServer(app)
var port = process.env.PORT || Config.webConsole.port
server.listen(port, function () {
  console.log('Server listening at port ' + port)
})

app.get('/config.json', function (req, res) {
  fs.readFile(__dirname + '/../config/config.json', function (err, data) {
    if (err) console.log(err)

    res.end(
      JSON.stringify(
        JSON.parse(data).webConsole
      )
    )
  })
})

app.get('/scrape.json', function (req, res) {
  if (req.query.node) {
    var returnObj = {
      'count': 1,
      'hosts': {}
    }
    returnObj.hosts[req.query.node] = Scrape.hosts[req.query.node]

    res.end(JSON.stringify(returnObj, function (key, value) {
      // prevent sending socket
      if (key === 'socket') return undefined
      else return value
    }))
  } else {
    res.end(JSON.stringify(Scrape, function (key, value) {
      // prevent sending socket
      if (key === 'socket') return undefined
      else return value
    }))
  }
})

app.get('/jquery.js', function (req, res) {
  fs.readFile(__dirname + '/../node_modules/jquery/dist/jquery.min.js', function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})

app.get('/chart.js', function (req, res) {
  fs.readFile(__dirname + '/../node_modules/chart.js/dist/Chart.min.js', function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})

app.get('/bootstrap/bootstrap.js', function (req, res) {
  fs.readFile(__dirname + '/../node_modules/bootstrap/dist/js/bootstrap.min.js', function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})

app.get('/bootstrap/bootstrap.css', function (req, res) {
  fs.readFile(__dirname + '/../node_modules/bootstrap/dist/css/bootstrap.min.css', function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})
