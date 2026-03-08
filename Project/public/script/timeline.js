//this class includes a vis-timeline instance in it and provides tools to recreate the timeline and assigne required data, HTML container and 
//eventlisteneres based on the active page
class HistoryTimeline{
    #dataSet = {};
    #group = {};
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
            selectedItem ? selectedItem.scrollIntoView({behavior: "smooth", block:"center"}): null;
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

/*
Using data-* attribute for linking the items in the vis-timeline to the memebers in the database for scrolling purpose is inspired Mozilla[1][2] 
Using .on("select", callbacck(properties)) as the eventliatener for clicking on items in the vis-timeline is inspired by unpkg[3].
Applying attribute selector for finding elements based on there data-* attribute is inspired by mozilla[4]
References:
[1]Mozilla. "Use data attributes". Internet: https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes, 2025 [Accessible March 7th].
[2]Mozilla. "Element: scrollIntoView() method". Internet: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView, 2025 [Accessible March 7th].
[3]unpkg. "Timeline documentation". Internet: https://unpkg.com/vis@0.5.1/docs/timeline.html, [Accessible March 7th].
[4]Mozilla. "Attribute selectors". Interent: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors, 2025 [Accessible March 7th].
*/