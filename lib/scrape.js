var Config = require('../config/config.json')

var io = require('socket.io')()

Config.pullInterval = process.env.PULL_INTERVAL || Config.pullInterval
Config.webConsole = Config.pullInterval
Config.webConsole.chart.precision = process.env.CONSOLE_PRECISION || Config.webConsole.chart.precision

var MASTER = Config.master
MASTER.port = process.env.PORT || MASTER.port
MASTER.nbPull = 0

var NODES = {
  'count': 0,
  'hosts': {}
}

io.on('connection', function (socket) {
  var remote = socket.client.conn.remoteAddress
  console.log(remote + ' connect with socket ' + socket.id)

  // When Node is ready it emit hostname
  socket.on('hostname', function (hostname) {
    if (NODES.hosts[hostname] && NODES.hosts[hostname].active) {
      NODES.count--
      socket.disconnect()
    }
    // delete node from nodeslist
    socket.on('disconnect', function () {
      console.log(hostname + ' disconnect')
      NODES.count--
      NODES.hosts[hostname].active = false
    })

    console.log(remote + ' is ' + hostname)
    NODES.count++
    NODES.hosts[hostname] = {
      'active': true,
      'remote': remote,
      'socket': socket,
      'nbPush': NODES.hosts[hostname] && NODES.hosts[hostname].nbPush ? NODES.hosts[hostname].nbPush : MASTER.nbPull,
      'stats': {}
    }
  })

  // When Node push it stats
  socket.on('info', function (data) {
    NODES.hosts[data.hostname].nbPush++
    data.latency = (new Date()).getTime() - MASTER.lastPull // ms
    data.upAvg = NODES.hosts[data.hostname].stats.upAvg
    NODES.hosts[data.hostname].stats = data
  })
})
io.listen(MASTER.port)

// Pull all Nodes stats
function getNodesStats () {
  if (NODES.count > 0) {
    updateNodesUpAvg()
    MASTER.nbPull++
    MASTER.lastPull = (new Date()).getTime()
    console.log('Pull stats from Nodes')
    io.sockets.emit('info')
  }
}

function updateNodesUpAvg () {
  for (var key in NODES.hosts) {
    NODES.hosts[key].stats.upAvg = NODES.hosts[key].nbPush / MASTER.nbPull
  }
}
// Intervales
setInterval(getNodesStats, Config.pullInterval)

module.exports = NODES
