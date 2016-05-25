var Config = require('../config/config.json')

var io = require('socket.io')()

var MASTER = Config.master
var NODES = {
  'count': 0,
  'hosts': {}
}

io.on('connection', function (socket) {
  var remote = socket.client.conn.remoteAddress
  console.log(remote + ' connect with socket ' + socket.id)

  // When Node is ready it emit hostname
  socket.on('hostname', function (hostname) {
    var host = hostname

    // delete node from nodeslist
    socket.on('disconnect', function () {
      console.log(host + ' disconnect')
      NODES.count--
    })

    console.log(remote + ' is ' + hostname)
    NODES.count++
    NODES.hosts[hostname] = {
      'remote': remote,
      'socket': socket,
      'stats': {}
    }
  })

  // When Node push it stats
  socket.on('info', function (data) {
    data.latency = (new Date()).getTime() - MASTER.lastPull // ms
    NODES.hosts[data.hostname].stats = data
    console.log(NODES.hosts)
  })
})
io.listen(MASTER.port)

// Pull all Nodes stats
function getNodesStats () {
  if (NODES.count > 0) {
    MASTER.lastPull = (new Date()).getTime()
    console.log('Pull stats from Nodes')
    io.sockets.emit('info')
  }
}

// Intervales
setInterval(getNodesStats, Config.pullInterval)
