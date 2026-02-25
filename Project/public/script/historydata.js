
class HistoryData{
    data={};

    //this function is used instead of the constructor because constructor can not wahe await in it.
    async fetchData()
    {
        //PromiseAll is used so both asyncfunctions work in parallel
        try
        {
            const [technologyData, legislationData] = await Promise.all([ this.#fetchTechnologyHistory(), this.#fetchLegislationHistory()])
            this.data={
                "technology":technologyData["technology"],
                "legislation":legislationData["legislation"]
            }
            this.#idInserter(this.data["technology"]);
            this.#idInserter(this.data["legislation"]);
        }
        catch(err)
        {
            throw err;
        }
    }
    //this funstion adds id to the items of the data. This id will later be used for linking to the data set
    #idInserter(itemList)
    {
        let id = 1;
        itemList.forEach(item=>{
            item["id"] = id;
            id++;
        })
    }
    //This function sorets the data pased on their start date 
    #sortData(data)
    {
        data.sort((a,b)=>Number(a.start)-Number(b.start))
    }

    async #fetchTechnologyHistory()
    {
        try
        {
            let response = await fetch("/public/assets/json/technology.json");
            let data = await response.json();
            this.#sortData(data.technology);
            return data;
        }
        catch(err)
        {
            throw  err;
        }
        
    }
    async #fetchLegislationHistory()
    {
        try
        {
            let response = await fetch("/public/assets/json/legislation.json");
            let data = await response.json();
            this.#sortData(data.legislation);
            return data;
        }
        catch(err)
        {
            throw  err;
        }
    }
}

export {HistoryData}