import {LineChart} from "./line_chart.js"
//This is a class for creating doughnut charts. It is a class that is extended from LineChart class and its updateDataSet()
//and setupControllers() are overwritten to be customized for doughnut chart purposes.
class DoughnutChart extends LineChart
{
    constructor(data,selectedCategory,categories,labels,legends,type, selectedYear)
    {
        super(data,selectedCategory,categories,labels,legends,type);
        this.selectedYear = selectedYear
    }
    updateDataSet()
    {
        this.dataSets= [];
        //it is the year that pie chart will be created based on it
        let index = this.labelsList.indexOf("Total, all violations");
        this.labelsList.splice(0,1);
        let tempData =[]
        for(let label of this.labelsList)
        {
            for(let row of this.data[this.selectedCategory][label])
            {
                if (row["refPer"].split("-")[0] === this.selectedYear)
                {
                    tempData.push(row["value"])
                    break;
                }
            }
        }
        this.dataSets=[{
            label:"violations",
            data:tempData
        }];
    } 
    setupControllers()
    {
        if (this.radioButtonsContainer)
        {
            for(let radio of this.radioButtonsContainer)
            {
                if (radio.value == this.selectedYear)
                {
                radio.checked=true;
                break;
                }
            }
        }
        this.radioButtonsContainer?.forEach(radio => {
            radio.addEventListener("change", (e)=>{
                this.selectedYear = e.target.value;
                this.updateDataSet();
                this.chart.data.datasets = this.dataSets;
                this.chart.update();
            })
        });
    }
}
export{DoughnutChart}