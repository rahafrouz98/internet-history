//this source inspired to use data-*attribute to have a js file shared between multip;e pages:
//https://stackoverflow.com/questions/8410298/one-js-file-for-multiple-pages. 
//https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes
//https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
//https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors

import {HistoryTimeline} from "./timeline.js";
import {HistoryData} from "./historydata.js";
import {HistoryTemplateEngine} from "./history_template_engine.js";
import {StatisticsTemplateEngine} from "./statistics_template_engine.js";
import {BarChart} from "./charts/bar_chart.js";
import {EcommerceData} from "./stat_data_request.js";

let renderedHTMLContainer ={};
let historyTimeline = null;
let barChart = null;

document.addEventListener("DOMContentLoaded", async()=>{

    await initializ();
     await stats();
})

async function stats()
{
   //let internetUseData = await requestForInternetUse("Canada", "Total, 15 years and over");
   // let cyberCrimeData = await requestForCyberCrime("Canada", "Total, all violations", "Year to date data", "Q1");
    //console.log(internetUseData)
    //console.log(cyberCrimeData);
    //console.log(eCommerce.data);
}



async function initializ()
{
    //create a HistoryData and fetch data
    let historyData = new HistoryData;
    await historyData.fetchData();
    //create a HistoryItemsTEmplateEngine and generate the rendered htmls for technical and legislation pages 
    let historyEngine = new HistoryTemplateEngine(historyData.data);
    //historyEngine.enginOperator() returns an object of two elements. First element is the technology data and the second is the legislation data.
    renderedHTMLContainer = await historyEngine.enginOperator();
    //creates and loades data about statistics of ecommerce
    let eCommerce = new EcommerceData();
    await eCommerce.loadData();
    //create a StatisticsTemplateEngine and generate an HTML for the statistics page
    let statisticsEngine = new StatisticsTemplateEngine(eCommerce.data);
    //statisticsEngine.enginOperator() returns a text as the rendered HTML for the statistics page
    renderedHTMLContainer["statistics"] = await statisticsEngine.enginOperator();
    //embed the rendered html in the main element of the page
    let mainElement = document.querySelector("body>main")
    mainElement.innerHTML = renderedHTMLContainer["technology"];
    //generateh a vis-timeline and insert it in the page
    let visContainer = document.getElementById("visualization"); 
    historyTimeline = new HistoryTimeline(historyData.data, "100%", "40vh");
    historyTimeline.loadTimeilne("technology",visContainer)
    //add event listener to menue buttons
    barChart = new BarChart();

    menuEventListeners();
    contentsEventListeners("technology");
}

function menuEventListeners()
{
    //add events to the menue options
    let body = document.body;
    let bodyCategory = document.body.dataset.category

    let technologyButton = document.getElementById("technology");
    technologyButton.addEventListener("click",(event)=>{
        //console.log("technology clicked in: "+bodyCategory)
        loadContents("technology", event.currentTarget)
    })

    let legislationButton = document.getElementById("legislation");
    legislationButton.addEventListener("click",(event)=>{
        //console.log("legislation clicked in: "+bodyCategory)
        loadContents("legislation", event.currentTarget)
    })

    let statisticsButton = document.getElementById("statistics");
    statisticsButton.addEventListener("click",(event)=>{
        //console.log("statistics clicked in: "+bodyCategory)
        loadContents("statistics", event.currentTarget)
    })
}

//load and update the contents of the target page
function loadContents(targetCategory,switchedButton)
{
    //update the content of the menue and general elements for all pages
    let body = document.body;
    let activeCategory = document.body.dataset.category
    if(activeCategory == targetCategory)
    {
        return;
    }
    let activeButton = document.querySelector("nav>ul>li>a.active");
    activeButton.classList.remove("active");
    switchedButton.classList.add("active");
    body.dataset.category = targetCategory;
    let targetMain = document.querySelector("body>main");
    targetMain.innerHTML=renderedHTMLContainer[targetCategory];

    //update the specific contents (loaded by template engine) of each page 
    switch(targetCategory)
    {
        case "technology":
        case "legislation":
            let visContainer = document.getElementById("visualization");
            historyTimeline.loadTimeilne(targetCategory,visContainer);
            contentsEventListeners(targetCategory);
            break;
        case "statistics":
            let barContainer = document.getElementById("bar_chart");
            barChart.loadChart(barContainer);
    }

}
//add event listeners to the components in the main element(which are loaded by template engines)
function contentsEventListeners(category)
{
    switch(category)
    {
        case "technology":
        case "legislation":
            let timelineButtonList = document.querySelectorAll(".timeline_button");
            timelineButtonList.forEach(button=>{
                button.addEventListener("click", ()=>{
                    document.querySelector("#visualization").scrollIntoView({behavior: "smooth"})
                })
            })
            break;
    }

}

