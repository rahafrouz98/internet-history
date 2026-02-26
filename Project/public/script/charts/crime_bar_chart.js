//https://www.chartjs.org/docs/latest/developers/updates.html
class CrimeBarChart
{
  #chart = null;
  #cyberCrime= {};
  #selectedGeo=null;
  #dataSets =[];
  #radioButtonsContainer = null;
  #chechBoxContainer=null;
  #labelsList = []
  constructor(cyberCrimeData)
  {
    this.#cyberCrime = cyberCrimeData;
    this.#selectedGeo = "Canada";
    //this maked a shadow copy of the list and changing it does not change the original one.
    this.#labelsList = [...this.#cyberCrime.data["labelsObject"]["violation"]];
  }
  #addEventListener()
  {
    this.#radioButtonsContainer.forEach(radio => {
      radio.addEventListener("change", async (e)=>{
        console.log("radio clicked")
        this.#selectedGeo = e.target.value;
        //it checks the first object of the selected Geo to verify if its data has already loaded or not
        if(this.#cyberCrime.data[this.#selectedGeo]["Total, all violations"].length ===0)
        {

          await this.#cyberCrime.loadData(this.#selectedGeo);
        }
        
        this.#updateDataSet();
        this.#chart.data.datasets = this.#dataSets;
        this.#chart.update();
      })
    });

    this.#chechBoxContainer.forEach(box=>{
      box.addEventListener("change", (e)=>{
          if(e.target.checked == true)
          {
            this.#labelsList.push(e.target.value)
            this.#labelsList.sort()
          }
          else
          {
            let index = this.#labelsList.indexOf(e.target.value)
            this.#labelsList.splice(index,1);
          }
        this.#chart.update();

      })
    })
  }
  #updateDataSet()
  {
    this.#dataSets = [];
    for(let yearLabel of this.#cyberCrime.data["labelsObject"]["year"])
    {
      let tempValuList=[];
      for( let violation in this.#cyberCrime.data[this.#selectedGeo])
      {
        for(let row of this.#cyberCrime.data[this.#selectedGeo][violation])
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
    this.#radioButtonsContainer = container.parentElement.parentElement.querySelector("div.chart_data_container").querySelector('div.geo').querySelectorAll("[name=geo]");
    for(let radio of this.#radioButtonsContainer)
    {
      if (radio.value == this.#selectedGeo)
      {
        radio.checked=true;
        break;
      }
    }
    //finds the check boxes and put them in a container
    this.#chechBoxContainer = container.parentElement.parentElement.querySelector("div.chart_data_container").querySelector("div.violation").querySelectorAll("[name=violation]")
 

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