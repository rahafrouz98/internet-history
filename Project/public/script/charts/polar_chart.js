import {LineChart} from "./line_chart.js"
class PolarChart extends LineChart
{
    constructor(data,selectedCategory,categories,labels,legends,type)
    {
        super(data,selectedCategory,categories,labels,legends,type);
        this.type = type;
    }
    updateDataSet()
    {
        this.dataSets= [];
        //find the most recent year that exist in the dat
        let recentYear = this.data["labelsObject"]["year"][this.data["labelsObject"]["year"].length-1];
        console.log(recentYear)
        for(let category in this.data)
        {
            let valueList = [];
            for(let legend of this.legendList)
            {
                for(let row of this.data[this.selectedCategory][legend])
                {
                    if (row["refPer"].split("-")[0] === recentYear)
                    {
                        console.log(row)
                        valueList.push(row["value"])
                        break;
                    }
                }
                console.log(valueList)
            }
            let tempData = {data: valueList};
            this.dataSets.push(tempData);
        }
    }
    
}
export{PolarChart}