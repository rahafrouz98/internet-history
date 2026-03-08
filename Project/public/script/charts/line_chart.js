//https://www.chartjs.org/docs/latest/charts/line.html
//this class is used for creating a line chart. It is also used as a parent class for creating classes for other charts. 
class LineChart
{
  chart = null;
  data = {};
  selectedCategory =null;
  dataSets =[];
  radioButtonsContainer = null;
  chechBoxContainer=null;
  labelsList = [];
  type = null;
  categoriesList = null;
  xSeries = null;
  legendList = null;
  legendPadding = null;
  constructor(data,selectedCategory,categories,labels,legends,type)
  {
    this.data= data;
    this.selectedCategory = selectedCategory;
    //this maked a shadow copy of the list and changing it does not change the original one.
    this.type = type;
    this.categoriesList =[...this.data["labelsObject"][categories]];
    legends? this.legendList = [...this.data["labelsObject"][legends]]: null;
    labels? this.labelsList = [...this.data["labelsObject"][labels]]: null;
    this.legendPadding = 8;
  }
  setupControllers()
  {
    if (this.radioButtonsContainer)
    {
      for(let radio of this.radioButtonsContainer)
      {
        if (radio.value == this.selectedCategory)
        {
          radio.checked=true;
          break;
        }
      }
    }
    this.radioButtonsContainer?.forEach(radio => {
      radio.addEventListener("change", (e)=>{
        this.selectedCategory = e.target.value;
        this.updateDataSet();
        this.chart.data.datasets = this.dataSets;
        this.chart.update();
      })
    });

    this.chechBoxContainer?.forEach(box=>{
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
    for(let legend of this.legendList)
    { 
      let valueList = [];
      for(let row of this.data[this.selectedCategory][legend])
      {
          valueList.push(row["value"])
      }
      
      let tempDataSet = {
                          label: legend,
                          data: valueList
                        }
      this.dataSets.push(tempDataSet);
    }
  }
  loadControllers(container)
  {
    //finds the radio buttons and put thme in a container and selects one of them as a default
    this.radioButtonsContainer = container.parentElement.parentElement?.querySelector("div.data_container")?.querySelector('div.radio')?.querySelectorAll("input");
    
    //finds the check boxes and put them in a container
    this.chechBoxContainer = container.parentElement.parentElement?.querySelector("div.data_container")?.querySelector("div.check_box")?.querySelectorAll("input")
  }
  makeChart(container)
  {
    this.loadControllers(container);
    this.setupControllers()
    this.updateDataSet();
    this.chart =  new Chart(container, {
        type: this.type,
        data: {
                labels: this.labelsList,
                datasets: this.dataSets
            },
        options:{
                plugins:{
                  legend:{
                    labels:{
                      padding:this.legendPadding
                    }
                  }
                }
              }
    });
  }
}
export{LineChart}

/*The use of chart.js for creating line chart and configuration is inspired by chart.js[1].
[1]chart.js. "Line Chart". Internet: https://www.chartjs.org/docs/latest/charts/line.html, 2025 [Accessible in March 7]
*/ 