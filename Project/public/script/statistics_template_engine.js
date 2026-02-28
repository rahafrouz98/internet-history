class StatisticsTemplateEngine 
{
    #template_url = "";
    #template = "";
    #dataContainer={};
    constructor(ecommerceData, cyberCrimeData, internetUseData)
    {
        this.#dataContainer =
                            {
                                "crime":cyberCrimeData,
                                "sale":ecommerceData,
                                "internet":internetUseData
                            }

        this.#template_url = "/public/html/templates/statistics_template.html";
    }

    #renderTemplate()
    {
        // Each loops
        this.#template = this.#template.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, eachName, templateFragment) => {
            let nameFragments = eachName.split("_")
            let dataName = nameFragments[1];
            let arrayName = nameFragments[0];
            let dataArray = this.#dataContainer[dataName]["labelsObject"][arrayName]
            return dataArray.map(item=>{return this.#replaceFragment(templateFragment, item)}).join("");
        })

        return this.#template;
    }
    #replaceFragment(templateFragment, item) 
    {
        return templateFragment.replace(/{{(\w+)}}/g, item);
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

