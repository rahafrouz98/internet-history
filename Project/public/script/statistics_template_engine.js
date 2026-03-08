//this engine taked statistics data and render and HTML for the main element of statistics page.
class StatisticsTemplateEngine 
{
    #template_url = "";
    #template = "";
    #dataContainer={};
    constructor(data)
    {
        this.#dataContainer = data; 
        this.#template_url = "/public/html/templates/statistics_template.html";
    }

    #renderTemplate()
    {
        // Each loops
        this.#template = this.#template.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, eachName, templateFragment) => {
            let nameFragments = eachName.split("_")
            let dataName = nameFragments[1];
            let arrayName = nameFragments[0];
            let listOfThings= this.#dataContainer[dataName]["labelsObject"][arrayName]
            return listOfThings.map(item=>{return this.#replaceFragment(templateFragment, item)}).join("");
        })
        return this.#template;
    }
    #replaceFragment(templateFragment, item) 
    {
        //this condition is to exclude the "Total, all violations" from the doughnut chart check boxes 
        if (item !== "Total, all violations")
        {
            return templateFragment.replace(/{{(\w+)}}/g, item);
        }
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

