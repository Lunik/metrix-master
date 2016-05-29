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
      appendTitleNodeList()
      appendNodeNb(data.count, Object.keys(data.hosts).length)
      appendLatencyAvg(data.hosts)
      appendUpTimeAvg(data.hosts)
      appendLoadAvg(data.hosts)
      appendNodeList(data.hosts)
    }

    function appendNodeNb (count, total) {
      $('.big-info#nodes-nb .data').text(count + ' / ' + total)

      appendChartNodeNb(count, total)
    }

    function appendChartNodeNb (count, total) {
      CHARTS['node-nb'] = CHARTS['node-nb'] ? CHARTS['node-nb'] : getListOf(config.chart.precision - 1, 0)
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

    function appendChartLatencyAv (avg) {
      CHARTS['latency-avg'] = CHARTS['latency-avg'] ? CHARTS['latency-avg'] : getListOf(config.chart.precision - 1, 0)
      CHARTS['latency-avg'].push(avg % 100)

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
          appendChartUpTimeAvg(avg * 100)
        }
      })
    }

    function appendChartUpTimeAvg (avg) {
      CHARTS['uptime-avg'] = CHARTS['uptime-avg'] ? CHARTS['uptime-avg'] : getListOf(config.chart.precision - 1, 0)
      CHARTS['uptime-avg'].push(avg)

      drawBarChart(CHARTS['uptime-avg'], 100, '.chart-info#uptime-avg .canvas', 0)
    }

    function appendLoadAvg (hosts) {
      var avg = 0
      var nb = 0
      $.each(hosts, function (index, value) {
        nb++
        avg += value.stats.loadavg && value.stats.loadavg[0] ? value.stats.loadavg[0] : 0

        // if all callback have been proceed
        if (Object.keys(hosts).length === nb) {
          avg = Math.floor((avg / nb) * 100) / 100
          $('.big-info#load-avg .data').text(avg + '%')

          appendChartLoadAvg(avg)
        }
      })
    }

    function appendChartLoadAvg (avg) {
      CHARTS['load-avg'] = CHARTS['load-avg'] ? CHARTS['load-avg'] : getListOf(config.chart.precision - 1, 0)

      CHARTS['load-avg'].push(avg.up)

      drawBarChart(CHARTS['load-avg'], 100, '.chart-info#load-avg .canvas')
    }

    function drawBarChart (data, max, selector, colorReverse) {
      /* scale is a function that normalizes a value in data into the range 0-98 */
      var scale = d3.scale.linear()
        .domain([0, max])
        .range([0, 90])

      var bars = d3.select(selector)
        .selectAll('div')
        .data(data)
        .enter().append('div')

      bars.style('height', function (d) { return scale(d) + '%' })
      bars.attr('value', function (d) { return d })
      bars.style('width', (100 / (config.chart.precision)) + '%')

      var mouseEvent = null
      $(selector).children().hover(function () {
        var self = this
        mouseEvent = $(document).mousemove(function (event) {
          $(self).children('.title').remove()

          var $title = $('<div>')
            .addClass('title')
            .text($(self).attr('value'))
            .css('top', event.pageY - 30)

          $(self).append($title)
        })
      }, function () {
        $(this).children('.title').remove()
        if (mouseEvent) {
          mouseEvent.unbind()
        }
      })

      if (colorReverse) {
        bars.style('background-color', function (d) { return getColorFromScale(100 - scale(d)) })
      } else {
        bars.style('background-color', function (d) { return getColorFromScale(scale(d)) })
      }

      if (data.length > config.chart.precision - 1) {
        data.shift()
        $(selector).children('div')[0].remove()
      }
    }

    function appendTitleNodeList () {
      var $icons = $('.node-list thead i')

      var mouseEvent = null

      $icons.hover(function () {
        var self = this
        mouseEvent = $(document).mousemove(function (event) {
          $(self).children('.title').remove()

          var $title = $('<div>')
            .addClass('title')
            .text($(self).attr('title'))
            .css('top', event.pageY - 30)

          $(self).append($title)
        })
      }, function () {
        $(this).children('.title').remove()
        if (mouseEvent) {
          mouseEvent.unbind()
        }
      })
    }

    function appendNodeList (hosts) {
      var $table = $('.node-list tbody')

      $.each(hosts, function (index, value) {
        var stats = value.stats

        if ($('.node-list tbody tr#' + index).length > 0) {
          $('.node-list tbody tr#' + index).attr('remove', 'true')
        }

        var $row = $('<tr>').attr('id', index)
          .append(
            $('<td>').attr('id', 'active')
              .attr('active', value.active)
              .html($('<i>')
              .addClass('fa fa-circle-o-notch')),
            $('<td>').attr('id', 'hostname')
              .text(stats.hostname),
            $('<td>').attr('id', 'type')
              .text(stats.os.name + ' / ' + stats.os.platform + ' / ' + stats.os.release + ' / ' + stats.os.arch),
            $('<td>').attr('id', 'latency')
              .text(stats.latency)
              .css('color', getColorFromScale(100 - stats.latency)),
            $('<td>').attr('id', 'cpu')
              .text(stats.cpu.type + ' / ' + stats.cpu.core + 'core / ' + (stats.cpu.speed / 1000) + 'GHz'),
            $('<td>').attr('id', 'loadavg')
              .text(formatPercent(stats.loadavg['1m']) + '% / ' + formatPercent(stats.loadavg['5m']) + '% / ' + formatPercent(stats.loadavg['15m']) + '%')
              .css('color', getColorFromScale(100 - (formatPercent(stats.loadavg['1m']) + formatPercent(stats.loadavg['5m']) + formatPercent(stats.loadavg['15m'])) / 3)),
            $('<td>').attr('id', 'memory')
              .text(formatData(stats.mem.total - stats.mem.free) + ' / ' + formatData(stats.mem.total) + ' (' + formatPercent((stats.mem.total - stats.mem.free) / stats.mem.total) + '%)')
              .css('color', getColorFromScale(100 - formatPercent((stats.mem.total - stats.mem.free) / stats.mem.total))),
            $('<td>').attr('id', 'interfaces')
              .text(stats.interfaces[Object.keys(stats.interfaces)[1]][0].address + ' / '+stats.interfaces[Object.keys(stats.interfaces)[1]][0].mac),
            $('<td>').attr('id', 'speed')
              .text(stats.speed.up + ' / '+stats.speed.down),
            $('<td>').attr('id', 'uptimeAvg')
              .text(formatPercent(stats.upAvg) +'%')
              .css('color', getColorFromScale(100 - stats.upAvg))
        ).click(function(){
          window.location.hash = $(this).attr('id')
        })
        .appendTo($table)
      })

      $('.node-list tbody tr[remove=true]').remove()
    }

    function formatPercent (value) {
      return Math.floor(value * 100)
    }

    // bytes to formated data
    function formatData (bytes) {
      var sizes = ['B', 'kB', 'MB', 'GB', 'TB']
      if (bytes === 0) return '0 B'
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
    }

    function getListOf (nb, element) {
      var array = []
      for (var i = 0; i < nb; ++i) {
        array.push(element)
      }
      return array
    }

    function getColorFromScale (percent) {
      percent = Math.floor(percent)
      if (percent > 66) return '#27AE60'
      else if (percent > 33) return '#F7A253'
      else return '#F75353'
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
