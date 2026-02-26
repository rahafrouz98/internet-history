//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with
import eCommerceTemplate from "./statcan_datasets_template/e_commerce_data_template.json" with { type: "json" }
class EcommerceData
{
    data=null;
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