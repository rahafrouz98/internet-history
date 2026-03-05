//https://visjs.github.io/vis-timeline/docs/timeline/
//https://github.com/visjs/vis-timeline
//https://app.unpkg.com/vis-timeline@8.5.0/files/README.md
//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*


class HistoryTimeline{
    #activeCategory = "technology";
    #dataSet = {};
    #group = {};
    #technologyGroup = null;
    #legislationGroup = null;
    #options = null;
    timeline = null;

    constructor(data, w, h)
    {
        this.#options = {
            width: w,
            maxHeight: h,
            stack:true,
            zoomMin: 150000000000,
            verticalScroll:true,
            type:"box",
            margin:{axis:100}
        }

        this.#dataSet = {
            "technology": new vis.DataSet(this.#dataSetExtractor(data["technology"])),
            "legislation": new vis.DataSet(this.#dataSetExtractor(data["legislation"]))
        }
        this.#group = {
            "technology": this.#groupExtractor(data["technology"]),
            "legislation": this.#groupExtractor(data["legislation"])
        }
    }
    loadTimeilne(category,container)
    {
        this.timeline = new vis.Timeline(container, this.#dataSet[category],this.#group[category] ,this.#options);
        this.timeline.on('select', function (properties) {
            let selectedItem = document.querySelector(`[data-content="${properties["items"][0]}"]`);
            selectedItem ? selectedItem.scrollIntoView({behavior: "smooth"}): null;
        });
        window.addEventListener("resize", () => {this.timeline.redraw();});
    }
    #dataSetExtractor(data)
    {
        let tempDataSet =[];
        data.forEach(item => {
            let tempObject = null;
            if(item["end"])
            {
                tempObject = { id:item["id"], content:item["title"], start:new Date(item["start"]),end:new Date(item["end"]), group:item["category"] };
            }
            else
            {
                tempObject = { id:item["id"], content:item["title"], start:new Date(item["start"]), group:item["category"] };
            }
            tempDataSet.push(tempObject);
        })
        return tempDataSet;
    }
    #groupExtractor(data)
    {
        let tempGroup=[]
        let idCounter = 1;
        //to have the record of added groups to the thempGroup
        let groupCheck =[]
        data.forEach(item=>{
            if(!groupCheck.includes(item["category"]))
            {
                tempGroup.push({id:item["category"], content:item["category"]});
                groupCheck.push(item["category"]);
            }
            idCounter++;
        })
        return tempGroup;   
    }
}

export {HistoryTimeline}
