
class HistoryData{
    data={};

    //this funstion adds id to the items of the data. This id will later be used for linking to the data set in vis time-lines
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

    async loadData()
    {
        try
        {
            let response = await fetch("/history");
            let data = await response.json();
            this.#sortData(data["technology"]);
            this.#sortData(data["legislation"]);
            this.#idInserter(data["technology"]);
            this.#idInserter(data["legislation"]);
            this.data = data;
        }
        catch(err)
        {
            console.log("fetching data at for technology history was unsuccessful. ")
            console.log("Error message: " + err)
        }
        
    }

}

export {HistoryData}