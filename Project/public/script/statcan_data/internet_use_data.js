//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
import internetUseTemplate from "./internet_use_data_template.json" with { type: "json" }
class InternetUseData
{
    data={};
    constructor()
    {
        this.data= internetUseTemplate;
    }
    async loadData()
    {
        let promises=[];
        for(let geo in this.data)
        {
           for( let age in this.data[geo])
           {
                let promise = this.#requestForInternetUse(geo, age).then(result => this.data[geo][age]=result).
                    catch( err=>{
                                    console.log(`Receiving data for for ${geo} -> ${age} was unsuccessful`);
                                    console.log("Error Message" +err);
                                });
                promises.push(promise);
            }
        }
        await Promise.all(promises);
        this.labelsExtractor();
    }
     //this adda labels for the data sets to be used in the charts and template engine
    labelsExtractor()
    {
        this.data["labelsObject"] = {}
        this.data["labelsObject"]["year"]= this.#yearListExtractor();
        this.data["labelsObject"]["geo"]= this.#geoListExtractor();
        this.data["labelsObject"]["age"]=this.#ageGroupListExtractor();
    }

    async #requestForInternetUse(geo, age)
    {
        let tempBody = {
                            "geo":geo,
                            "agegroup":age
                        }
        let options = 
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(tempBody)
        }
        try
        {
            let statCanResponse = await fetch(`/internetuse`, options)
            let data = await statCanResponse.json()
            return data
        }
        catch(err)
        {
            console.log(err);
            throw err;
        }
    }
    //this function extract the existing sales types and return in a form of array to be used later in the template engin and charts
    #ageGroupListExtractor()
    {
        let ageGroups=[];

        //it just itterate through the elements of the first object of data to extract the sale types
        for(let key in this.data)
        {
            if(key!=="labelsObject")
            {
                for(let keyofkey in this.data[key])
                {
                    if(!ageGroups.includes(keyofkey))
                    {
                        ageGroups.push(keyofkey);
                    }
                }
             }
             return ageGroups;
        }
    }
    //this function extract the existing years and return in a form of array to be used later in the template engin and charts
    #geoListExtractor()
    {
        let geo=[]
        //it just itterate the first array of the data to extract the existing years in it
        for(let key in this.data)
        {           
            geo.push(key);
        }
        return geo;
    }
    //this function extract the existing years and return in a form of array to be used later in the template engin and charts
    #yearListExtractor()
    {
        let years=[]
        //it just itterate the first array of the data to extract the existing years in it
        for(let key in this.data)
        {
            if(key!=="labelsObject")
            {
                for(let keyofkey in this.data[key])
                {
                    for(let dataRow of this.data[key][keyofkey])
                    {
                        let tempYear = dataRow["refPer"];
                        tempYear = tempYear.split('-')[0];
                        if (!years.includes(tempYear))
                        {
                            years.push(tempYear);
                        }
                    }
                    return  years;
                }
            }
        }
    }
}


export {InternetUseData}