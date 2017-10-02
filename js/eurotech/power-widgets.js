
var sparkLineData;
var sparkLine;

function initPowerWidgets() {
    updateAllSensors();
    setTimeout(function(){
      updateAnalytics();
      initPowerConsumptionChart();
    }, 1000);
}

function initPowerConsumptionChart () {
  var startDate = moment().subtract("30", "minutes").unix() * 1000;
  var endDate = moment().unix() * 1000;
  getMonnitSensorHistory("currentTwenty", function(data){
    var dataPoints = [];
    for (var i in data.message) {
      var metrics = getMetrics(data.message[i].payload.metrics.metric);
      dataPoints.push({
        x: Date.parse(data.message[i].receivedOn),
        y: metrics.MaxCurrent
      });
    }
    drawConsumptionChart(dataPoints);
  },startDate, endDate)
}
function drawConsumptionChart(dataPoints) {
  nv.addGraph(function() {
    var traces = [];
    traces.push({
      values	: dataPoints,
      key			:	'Power Usage',
      color		: 'rgba(254, 192, 0, 0.5)'
    });
    var chart = nv.models.lineWithFocusChart();

    chart.brushExtent([50,70]);

    chart.xAxis.tickFormat(function(value) {
      var format = "%H:%M";
      return d3.time.format(format)(new Date(value));
    });
    chart.x2Axis.tickFormat(function(value) {
      var format = "%H:%M";
      return d3.time.format(format)(new Date(value));
    });
    chart.tooltip.enabled(false);
    chart.yAxis.tickFormat(d3.format(',.2f'));
    chart.y2Axis.tickFormat(d3.format(',.2f'));
    chart.useInteractiveGuideline(true);

    d3.select("#energyConsumptionChart")
        .datum(traces)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function drawPowerSparkLine() {
  nv.addGraph(function () {
    sparkLine = nv.models.sparklinePlus()
    .color(["rgba(254, 192, 0, 1)"])
    .showLastValue(false);
    d3.select("#powerSparkLine")
            .datum(monnitSensors.currentTwenty.dataPoints)
            .call(sparkLine);
    return sparkLine;
  });
}
function updateAnalytics() {
  var current = monnitSensors.currentTwenty;
  $("#power-current").html(current.MaxCurrent.toFixed(1) + " Amp");
  $("#power-average").html(current.AvgCurrent.toFixed(1) + " Amp");
}
