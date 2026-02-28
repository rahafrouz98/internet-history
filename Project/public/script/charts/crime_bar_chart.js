//https://www.chartjs.org/docs/latest/charts/bar.html
class CrimeBarChart
{
  #chart = null;
  #data= {};
  #dataSets =[];
  #checkBoxContainer=null;
  #labelsList = []
  #selectedCategory = null
  constructor(data,selectedCategory,labelList )
  {
    this.#data = data;
    this.#selectedCategory = selectedCategory;
    //this maked a shadow copy of the list and changing it does not change the original one.
    this.#labelsList = [...this.#data["labelsObject"][labelList]];
  }
  #addEventListener()
  {
    this.#checkBoxContainer.forEach(box => {
      box.addEventListener("change", async (e)=>{
          if(e.target.checked == true)
          {
            this.#labelsList.push(e.target.value)
            //puts the Canada first  of the list for easy reading
            let index = this.#labelsList.indexOf("Canada")
            {
              if (index !== 0 && index!==-1)
              {
                this.#labelsList.splice(index,1);
                this.#labelsList.unshift("Canada")
              }
            }
          }
          else
          {
            let index = this.#labelsList.indexOf(e.target.value)
            this.#labelsList.splice(index,1);
          }
        
        this.#updateDataSet();
        this.#chart.data.datasets = this.#dataSets;
        this.#chart.update();
      })
    });
  }
  #updateDataSet()
  {
    this.#dataSets = [];
    for(let yearLabel of this.#data["labelsObject"]["year"])
    {
      let tempValuList=[];
      for( let geo of this.#labelsList)
      {
        for(let row of this.#data[geo][this.#selectedCategory])
        {
          if (!row["refPer"].includes(yearLabel) )
          {
            tempValuList.push(row["value"])
          }
        }
      }
      let tempSet ={
                  "label": yearLabel, 
                  "data":[...tempValuList]
                  };

      this.#dataSets.push(tempSet);
    }
  }

  makeChart(container)
  {
    //finds the radio buttons and put thme in a container and selects one of them as a default
    this.#checkBoxContainer = container.parentElement.parentElement.querySelector("div.chart_data_container").querySelector('div.check_box').querySelectorAll("input");

    this.#addEventListener();
    this.#updateDataSet();
    this.#chart =  new Chart(container, 
    {
        type: 'bar',
        data: {
                labels: this.#labelsList,
                datasets: this.#dataSets
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
export{CrimeBarChart}