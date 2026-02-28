//https://www.chartjs.org/docs/latest/charts/line.html
//this is used for representing the Internet Use and E-Commerce sales
class StatsChart
{
  chart = null;
  data = {};
  selectedCategory =null;
  dataSets =[];
  radioButtonsContainer = null;
  chechBoxContainer=null;
  labelsList = [];
  type = null;
  constructor(data,selectedCategory,labelList,type)
  {
    this.data= data;
    this.selectedCategory = selectedCategory;
    //this maked a shadow copy of the list and changing it does not change the original one.
    this.labelsList = [...this.data["labelsObject"][labelList]];
    this.type = type;
  }
  addEventListener()
  {
    this.radioButtonsContainer.forEach(radio => {
      radio.addEventListener("change", (e)=>{
        this.selectedCategory = e.target.value;
        this.updateDataSet();
        this.chart.data.datasets = this.dataSets;
        this.chart.update();
      })
    });

    this.chechBoxContainer.forEach(box=>{
      box.addEventListener("change", (e)=>{
          if(e.target.checked == true)
          {
            this.labelsList.push(e.target.value)
            this.labelsList.sort()
          }
          else
          {
            let index = this.labelsList.indexOf(e.target.value)
            this.labelsList.splice(index,1);
          }
        this.updateDataSet();
        this.chart.data.datasets = this.dataSets;
        this.chart.update();
      })
    })
  }

  updateDataSet()
  {
    this.dataSets= [];
    for(let salesType in this.data[this.selectedCategory])
    { 
      let valueList = [];
      for(let year of this.labelsList)
      {
        for(let row of this.data[this.selectedCategory][salesType])
        {
          if(year === row["refPer"].split("-")[0])
          {
            valueList.push(row["value"])
          }
        }
      }
      let tempDataSet = {
                          label: salesType,
                          data: valueList
                        }
      this.dataSets.push(tempDataSet);
    }

  }
  makeChart(container)
  {
    //finds the radio buttons and put thme in a container and selects one of them as a default
    this.radioButtonsContainer = container.parentElement.parentElement.querySelector("div.chart_data_container").querySelector('div.radio').querySelectorAll("input");
    for(let radio of this.radioButtonsContainer)
    {
      if (radio.value == this.selectedCategory)
      {
        radio.checked=true;
        break;
      }
    }
    //finds the check boxes and put them in a container
    this.chechBoxContainer = container.parentElement.parentElement.querySelector("div.chart_data_container").querySelector("div.check_box").querySelectorAll("input")
 

    this.addEventListener();
    this.updateDataSet();
   
    this.chart =  new Chart(container, 
    {
        type: this.type,
        data: {
                labels: this.labelsList,
                datasets: this.dataSets
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
export{StatsChart}