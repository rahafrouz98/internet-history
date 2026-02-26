//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with
import cyberCrimeTemplate from "./cyber_crime_data_template.json" with { type: "json" }

class cyberCrimeData
{
    data={};
    constructor()
    {
        this.data= cyberCrimeTemplate;
    }
    async loadData(geo="Canada")
    {
        //just loads the data for canada for start 
        for( let violation in this.data[geo])
        {
            try
            {
                this.data[geo][violation] = await this.#requestForcyberCrime(geo, violation);
            }
            catch(err)
            {
                console.log(`Data for ${geo} + ${violation} is not available`)
            }
        }
        this.data["labelsObject"] = {};
        this.data["labelsObject"]["year"]= this.#yearListExtractor();
        this.data["labelsObject"]["violation"]=this.#violationExtractor();
        this.data["labelsObject"]["geo"]=this.#geoTypeExtractor();
    }

    async #requestForcyberCrime(geo, violation)
    {
        let tempBody = {
                        "geo":geo,
                        "violation": violation,
                        "statistic": "Year to date data",
                        "calendarquarter": "Q1"
                        }
        let options = 
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(tempBody)
        }
        try
        {
            let statCanResponse = await fetch(`/cybercrime`, options)
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
    #geoTypeExtractor()
    {
        let geos=[];

        for(let key in this.data)
        {
           if(!geos.includes(key) && key!=="labelsObject")
            {
                geos.push(key);
            }
        }
        return geos;
    }
    //this function extract the existing sales types and return in a form of array to be used later in the template engin and charts
    #violationExtractor()
    {
        let violations=[];

        //it just itterate through the elements of the first object of data to extract the sale types
        for(let key in this.data)
        {
            if(key!=="labelsObject")
            {
                for(let keyofkey in this.data[key])
                {
                    if(!violations.includes(keyofkey))
                    {
                        violations.push(keyofkey);
                    }
                }
             }
             return violations;
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

export {cyberCrimeData}