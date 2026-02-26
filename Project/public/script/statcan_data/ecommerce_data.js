//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with
import eCommerceTemplate from "./e_commerce_data_template.json" with { type: "json" }
class EcommerceData
{
    data={};
    constructor()
    {
        this.data= eCommerceTemplate;
    }
    async loadData()
    {
        for(let industry in this.data)
        {
           for( let saleType in this.data[industry])
           {
                try
                {
                    this.data[industry][saleType] =await this.#requestForEcommerce(industry, saleType);

                }
                catch(err)
                {
                    console.log(`Data for ${industry} + ${saleType} is not available`)
                }
            }
        }
        this.data["labelsObject"] = {}
        this.data["labelsObject"]["year"]= this.#yearListExtractor();
        this.data["labelsObject"]["salesType"]=this.#saleTypeExtractor();
        this.data["labelsObject"]["industry"]=this.#industryTypeExtractor();
        
    }


    async #requestForEcommerce(industry, sale)
    {
        let tempBody = {
                        "industry":industry,
                        "sales":sale
                        }
        let options = 
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(tempBody)
        }
        try
        {
            let statCanResponse = await fetch(`/ecommerce`, options)
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
    #industryTypeExtractor()
    {
        let industryTypes=[];

        for(let key in this.data)
        {
           if(!industryTypes.includes(key) && key!=="labelsObject")
            {
                industryTypes.push(key);
            }
          
        }
        return industryTypes;
    }
    //this function extract the existing sales types and return in a form of array to be used later in the template engin and charts
    #saleTypeExtractor()
    {
        let saleTypes=[];

        //it just itterate through the elements of the first object of data to extract the sale types
        for(let key in this.data)
        {
            if(key!=="labelsObject")
            {
                for(let keyofkey in this.data[key])
                {
                    if(!saleTypes.includes(keyofkey))
                    {
                        saleTypes.push(keyofkey);
                    }
                }
             }
             return saleTypes;
        }
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

async function requestForInternetUse(geo, agegroup)
{
    let tempBody = {
                    "geo":geo,
                    "agegroup":agegroup
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
        throw err;
    }
}
async function requestForCyberCrime(geo, violation, statistic, calendarquarter)
{
    let tempBody = {
                    "geo":geo,
                    "violation":violation,
                    "statistic":statistic,
                    "calendarquarter":calendarquarter
                     }
    let options = 
    {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(tempBody)
    }
    try
    {
        let statCanResponse = await fetch(`/cibercrime`, options)
        let jsondata = await statCanResponse.json()
        return jsondata
    }
    catch(err)
    {
        throw err;
    }
}

export {EcommerceData}