import {LineChart} from "./line_chart.js"
class PolarChart extends LineChart
{                   //(statisticsData["internetUse"], "Canada", "geo","age","age" ,"polarArea", "2025");
    constructor(data,selectedCategory,categories,labels,legends,type, selectedYear)
    {
        super(data,selectedCategory,categories,labels,legends,type);
        this.selectedYear = selectedYear;
    }
    updateDataSet()
    {
        this.dataSets= [];
        //find the most recent year that exist in the dat
        let recentYear = this.data["labelsObject"]["year"][this.data["labelsObject"]["year"].length-1];
        for(let category in this.data)
        {
            let valueList = [];
            for(let legend of this.legendList)
            {
                for(let row of this.data[this.selectedCategory][legend])
                {
                    if (row["refPer"].split("-")[0] === recentYear)
                    {
                        valueList.push(row["value"])
                        break;
                    }
                }
            }
            let tempData = {data: valueList};
            this.dataSets.push(tempData);
        }
    }
    
}
export{PolarChart}