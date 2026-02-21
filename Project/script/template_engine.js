//This template engine is taken from the week 11 of the module CM1040
class TemplateEngine {
    constructor(template_url) {
        this.template_url = template_url;
    }
    template = null;

    loadTemplate() {
        return fetch(this.template_url)
            .then(response => response.text())
            .then(text => {
                this.template = text;
            });
    }

    renderTemplate(tag_id, data) {
        const tag = document.getElementById(tag_id);
        let output = this.template;

        // Each loops
        output = output.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, templateFragment) => {
            const listOfThings = data[arrayName];

            if (!Array.isArray(listOfThings)) {
                return '';
            }
            return listOfThings.map(item => this.replaceVariablesInFragment(templateFragment, item)).join('');
        });

        // If-Else conditions
        output = output.replace(/{{#if (\w+)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g, (match, condition, ifContent, elseContent) => {
            return data[condition] ? ifContent : elseContent;
        });

        // If conditions without else
        output = output.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, ifContent) => {
            return data[condition] ? ifContent : '';
        });

        // Variable swapping
        output = output.replace(/{{(\w+)}}/g, (match, dataField) => {
            return data[dataField];
        });

        tag.innerHTML = output;
    }

    replaceVariablesInFragment(templateFragment, data) {
        return templateFragment.replace(/{{(\w+)}}/g, (match, dataKey) => {
            return data[dataKey];
        });
    }
}

// Create an instance and load the template
const tEngine = new TemplateEngine('template.html');


tEngine.loadTemplate().then(()=> fetch(`/history`)).then(response => response.json()).
                                                        then(jsonData => {        
                                                                            console.log(jsonData);
                                                                            tEngine.renderTemplate('content',jsonData)
                                                                        })
                                                    
                            
