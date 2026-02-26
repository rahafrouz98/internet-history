

class StatisticsTemplateEngine {

    #template_url = "";
    #template = "";
    #eCommerceData={};
    constructor(ecommerceData)
    {
        this.#eCommerceData = ecommerceData
        this.#template_url = "/public/html/templates/statistics_template.html";
    }
    #yearListExtractor(data)
    {
        let years=[]
        //it just itterate the first array of the datato extract the existing years in it
        for(let key in data)
        {
            for(let keyofkey in data[key])
            {
                for(let dataRow of data[key][keyofkey])
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
    #renderTemplate()
    {
        // Each loops
        this.#template = this.#template.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, loopName, templateFragment) => {
            if (loopName == "years")
            {
                let years = this.#yearListExtractor(this.#eCommerceData)
                return years.map(item=>{return this.#replaceYearFragment(templateFragment, item)}).join("");
            }
        
        })

        return this.#template;
    }
    #replaceYearFragment(templateFragment, year) 
    {
        console.log(year)
        return templateFragment.replace(/{{#year}}/g, year);
    }
    async #loadTemplate() 
    {
        try
        {
            let response = await fetch(this.#template_url);
            this.#template = await response.text();
        }
        catch(err)
        {
            throw err;
        }                                                                              
    }
    async enginOperator()
    {
        await this.#loadTemplate();
        let renderedHTML = this.#renderTemplate();  
        return renderedHTML;
    }
}

export{StatisticsTemplateEngine}

