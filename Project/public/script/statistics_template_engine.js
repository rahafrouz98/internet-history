
class StatisticsTemplateEngine {

    #template_url = "";
    #template = "";
    constructor()
    {
        this.#template_url = "/public/html/templates/statistics_template.html";
    }
    #renderTemplate()
    {
        return this.#template;
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

