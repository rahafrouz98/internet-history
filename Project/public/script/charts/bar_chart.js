class BarChart
{
  chart = null;
  constructor()
  {
  }
  loadChart(container)
  {
    this.chart =  new Chart(container, 
    {
        type: 'bar',
        data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [
                            {
                              label: '# of Votes1',
                              data: [12, 19, 3, 5, 2, 3],
                              borderWidth: 1
                            },
                            {
                              label: '# of Votes2',
                              data: [12, 19, 3, 5, 2, 3],
                              borderWidth: 1
                            },
                            {
                              label: '# of Votes',
                              data: [12, 19, 3, 5, 2, 3],
                              borderWidth: 1
                            }
                          ]
              },
        options: {
                    scales: 
                    {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }
    });
  }
}
export{BarChart}