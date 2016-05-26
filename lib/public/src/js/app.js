;(function () {
  var HASH = window.location.hash.slice(1)
  console.log(HASH)
  // get the config
  $.getJSON('/config.json', function (config) {
    // update web console Intervales
    myInterval(getData, config.reloadInterval)

    function getData () {
      $.getJSON('/scrape.json?node=' + HASH, function (data) {
        console.log(data)
        appendData(data)
      })
    }

    function appendData (data) {
      appendNodeNb(data.count, Object.keys(data.hosts).length)
      appendLatencyAvg(data.hosts)
      appendUpTimeAvg(data.hosts)
      appendSpeedAvg(data.hosts)
    }

    function appendNodeNb (count, total) {
      $('.big-info#nodes-nb .data').text(count + ' / ' + total)
    }

    function appendLatencyAvg (hosts) {
      var avg = 0
      var nb = 0
      $.each(hosts, function (index, value) {
        nb++
        avg += value.stats.latency ? value.stats.latency : 0

        // if all callback have been proceed
        if (Object.keys(hosts).length === nb) {
          avg = Math.floor(avg / nb)
          $('.big-info#latency-avg .data').text(avg)
        }
      })
    }

    function appendUpTimeAvg (hosts) {
      var avg = 0
      var nb = 0
      $.each(hosts, function (index, value) {
        nb++
        avg += value.stats.uptime ? value.stats.uptime : 0

        // if all callback have been proceed
        if (Object.keys(hosts).length === nb) {
          avg = Math.floor(avg / nb)
          $('.big-info#uptime-avg .data').text(secondsToHms(avg))
        }
      })
    }

    function appendSpeedAvg (hosts) {
      var avg = {
        'up': 0,
        'down': 0
      }
      var nb = 0
      $.each(hosts, function (index, value) {
        nb++
        avg.up += value.stats.speed.up ? value.stats.speed.up : 0
        avg.down += value.stats.speed.down ? value.stats.speed.down : 0

        // if all callback have been proceed
        if (Object.keys(hosts).length === nb) {
          avg.up = Math.floor((avg.up / nb) * 100) / 100
          avg.down = Math.floor((avg.down / nb) * 100) / 100
          $('.big-info#speed-avg .data .speed#up').text(avg.up)
          $('.big-info#speed-avg .data .speed#down').text(avg.down)
        }
      })
    }

    function secondsToHms (time) {
      time = Number(time)
      var h = Math.floor(time / 3600)
      var m = Math.floor(time % 3600 / 60)
      var s = Math.floor(time % 3600 % 60)
      return ((h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s)
    }

    function myInterval (fn, t) {
      fn()
      return (setInterval(fn, t))
    }
  })
})()
