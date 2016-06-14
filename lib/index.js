var Config = require('../config/config.json')
var Scrape = require('./scrape.js')

var express = require('express')
var path = require('path')
var http = require('http')
var fs = require('fs')

http.globalAgent.maxSockets = Infinity

var app = express()
app.use(express.static(path.join(__dirname, '/public')))

var server = http.createServer(app)
var port = process.env.CONSOLE_PORT || Config.webConsole.port
server.listen(port, function () {
  console.log('Server listening at port ' + port)
})

app.get('/config.json', function (req, res) {
  fs.readFile(path.join(__dirname, '/../config/config.json'), function (err, data) {
    if (err) console.log(err)
    data = JSON.parse(data)
    data.webConsole.reloadInterval = process.env.PULL_INTERVAL || data.webConsole.reloadInterval
    data.webConsole.chart.precision = process.env.CONSOLE_PRECISION || data.webConsole.chart.precision

    res.end(
      JSON.stringify(
        data.webConsole
      )
    )
  })
})

app.get('/scrape.json', function (req, res) {
  if (req.query.node) {
    var returnObj = {
      'count': Scrape.hosts[req.query.node] && Scrape.hosts[req.query.node].active ? 1 : 0,
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
  fs.readFile(path.join(__dirname, '/../node_modules/jquery/dist/jquery.min.js'), function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})

app.get('/d3.js', function (req, res) {
  fs.readFile(path.join(__dirname, '/../node_modules/d3/d3.min.js'), function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})

app.get('/bootstrap/bootstrap.js', function (req, res) {
  fs.readFile(path.join(__dirname, '/../node_modules/bootstrap/dist/js/bootstrap.min.js'), function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})

app.get('/bootstrap/bootstrap.css', function (req, res) {
  fs.readFile(path.join(__dirname, '/../node_modules/bootstrap/dist/css/bootstrap.min.css'), function (err, data) {
    if (err) console.log(err)

    res.end(data)
  })
})
