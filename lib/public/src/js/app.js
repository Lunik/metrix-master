;(function () {
  var HASH = window.location.hash.slice(1)
  var CHARTS = {}
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

      appendChartNodeNb(count, total)
    }

    function appendChartNodeNb (count, total) {
      CHARTS['node-nb'] = CHARTS['node-nb'] ? CHARTS['node-nb'] : getListOf(config.chart.precision-1, 0)
      CHARTS['node-nb'].push(count)

      drawBarChart(CHARTS['node-nb'], total, '.chart-info#nodes-nb .canvas', 0)
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
          appendChartLatencyAv(avg)
        }
      })
    }

    function appendChartLatencyAv(avg){
      CHARTS['latency-avg'] = CHARTS['latency-avg'] ? CHARTS['latency-avg'] : getListOf(config.chart.precision-1, 0)
      CHARTS['latency-avg'].push(avg%100)

      drawBarChart(CHARTS['latency-avg'], 100, '.chart-info#latency-avg .canvas', 1)
    }

    function appendUpTimeAvg (hosts) {
      var avg = 0
      var nb = 0.0
      $.each(hosts, function (index, value) {
        nb++
        avg += value.stats.upAvg ? value.stats.upAvg : 0
        // if all callback have been proceed
        if (Object.keys(hosts).length === nb) {
          avg = avg / nb
          $('.big-info#uptime-avg .data').text(Math.floor(avg * 100) + '%')
          appendChartUpTimeAvg(avg*100)
        }
      })
    }

    function appendChartUpTimeAvg(avg){
      CHARTS['uptime-avg'] = CHARTS['uptime-avg'] ? CHARTS['uptime-avg'] : getListOf(config.chart.precision-1, 0)
      CHARTS['uptime-avg'].push(avg)

      drawBarChart(CHARTS['uptime-avg'], 100, '.chart-info#uptime-avg .canvas', 0)
    }

    function appendSpeedAvg (hosts) {
      var avg = {
        'up': 0,
        'down': 0
      }
      var nb = 0
      $.each(hosts, function (index, value) {
        nb++
        avg.up += value.stats.speed && value.stats.speed.up ? value.stats.speed.up : 0
        avg.down += value.stats.speed && value.stats.speed.down ? value.stats.speed.down : 0

        // if all callback have been proceed
        if (Object.keys(hosts).length === nb) {
          avg.up = Math.floor((avg.up / nb) * 100) / 100
          avg.down = Math.floor((avg.down / nb) * 100) / 100
          $('.big-info#speed-avg .data .speed#up').text(avg.up)
          $('.big-info#speed-avg .data .speed#down').text(avg.down)
        }
      })
    }

    function drawBarChart(data, max, selector, colorReverse){
      /* scale is a function that normalizes a value in data into the range 0-98 */
      var scale = d3.scale.linear()
        .domain([0, max])
        .range([0, 90])

      var bars = d3.select(selector)
        .selectAll('div')
        .data(data)
        .enter().append('div')

      bars.style('height', function (d) { return scale(d) + '%' })
      //bars.style('margin-top', function (d) { return (100 - scale(d) * 1.15) + '%'})
      bars.style('width', (100 / (config.chart.precision)) + '%')
      if(colorReverse){
        bars.style('background-color', function(d){ return getColorFromScale(100 - scale(d)) })
      } else {
          bars.style('background-color', function(d){ return getColorFromScale(scale(d)) })
      }

      if (data.length > config.chart.precision - 1) {
        data.shift()
        $(selector).children('div')[0].remove()
      }
    }

    function getListOf(nb, element){
      var array = []
      for (var i = 0; i < nb; ++i){
        array.push(element)
      }
      return array
    }
    function getColorFromScale(percent){
      percent = Math.floor(percent)
      if(percent > 66) return "#27AE60"
      else if (percent > 33) return "#F7A253"
      else return "#F75353"
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
