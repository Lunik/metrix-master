var Config = require('../config/config.json')

var _ = require('underscore')

var io = require('socket.io')()
var util = require('util');

var MASTER = Config.master
var NODES = {}

io.on('connection', function (socket) {
  var remote = socket.client.conn.remoteAddress
  console.log(remote + ' connect with socket ' + socket.id)

  // When Node is ready it emit hostname
  socket.on('hostname', function (hostname) {
    console.log(remote + ' is ' + hostname)
    NODES[hostname] = {
      'remote': remote,
      'socket': socket,
      'stats': {}
    }
  })

  // When Node push it stats
  socket.on('info', function (data) {
    data.latency = (new Date()).getTime() - MASTER.lastPull // ms
    NODES[data.hostname].stats = data
    console.log(util.inspect(NODES[data.hostname].stats, {showHidden: false, depth: null}))
  })
})
io.listen(MASTER.port)

// Pull all Nodes stats
function getNodesStats () {
  MASTER.lastPull = (new Date()).getTime()
  console.log('Pull stats from Nodes')
  io.sockets.emit('info')
}

// Intervales
setInterval(getNodesStats, Config.pullInterval)
