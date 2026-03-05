
import {LineChart} from "./line_chart.js"
class BarChart extends LineChart
{
    //(statisticsData["cyberCrime"], "Total, all violations", "violation", "geo", "year",'bar')
    constructor(data,selectedCategory,categories,labels,legends,type)
    {
        super(data,selectedCategory,categories,labels,legends,type);
    }
    updateDataSet()
    {
        this.dataSets = [];
        for(let legend of this.data["labelsObject"]["year"])
        {
            let tempValuList=[];
            for( let geo of this.labelsList)
            {
                for(let row of this.data[geo][this.selectedCategory])
                {
                    if (!row["refPer"].includes(legend) )
                    {
                        tempValuList.push(row["value"])
                    }
                }
            }
            let tempSet ={
                        "label": legend, 
                        "data":[...tempValuList]
                        };

            this.dataSets.push(tempSet);
        }
    }
    
}
export{BarChart}