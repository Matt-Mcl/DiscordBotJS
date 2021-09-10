const ChartJsImage = require('chartjs-to-image');

async function createGraph(dates, scores) {
  const myChart = new ChartJsImage();
  myChart.setConfig({
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Ranked Data',
        borderColor: 'rgb(255, 0, 0)',
        fill: false,
        data: scores,
      }],
    },
  });

  myChart.setWidth(1200).setHeight(600);
  
  await myChart.toFile('exportchart.png');

  return

  // return({
  //   type: 'line',
  //   data: {
  //     labels: dates,
  //     datasets: [{
  //       label: 'Ranked Data',
  //       borderColor: 'rgb(255, 0, 0)',
  //       data: scores,
  //     }],
  //   },
  // });
}

module.exports = {
  async rankGraph(apexdb) {
    const rankScoreData = apexdb.collection('rankScoreData');

    const data = await rankScoreData.find().toArray()
    const scores = data.map(item => item.score);
    const dates = data.map(item => new Date(parseInt(item._id.toString().substring(0, 8), 16) * 1000).toLocaleString('en-GB', { hour12: false, timeZone: 'Europe/London' }));

    // console.log(scores);
    // console.log(dates);
    
    return createGraph(dates, scores)
  }
}