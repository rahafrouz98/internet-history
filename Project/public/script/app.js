//this source inspired to use data-*attribute to have a js file shared between multip;e pages:
//https://stackoverflow.com/questions/8410298/one-js-file-for-multiple-pages. 
//https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes
//https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
//https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all

import {HistoryTimeline} from "./timeline.js";
import {HistoryData} from "./historydata.js";
import {HistoryTemplateEngine} from "./history_template_engine.js";
import {StatisticsTemplateEngine} from "./statistics_template_engine.js";
import {BarChart} from "./charts/bar_chart.js";
import {LineChart} from "./charts/line_chart.js"
import {PolarChart} from "./charts/polar_chart.js"
import {DoughnutChart} from "./charts/doughnut_chart.js"
let renderedHTMLContainer ={};
let historyTimeline = null;
let saleLineChart = null;
let crimeBarChart = null;
let crimeDoughnutChart = null;
let internetLineChart = null;
let statisticsEngine=null;
let internetPolarChart = null;
let historyData = null;
let statisticsData = null;


document.addEventListener("DOMContentLoaded", async()=>{

    await initializ();
})


async function initializ()
{
    //load history and statistics data with Promise.all() to decrease delays
    historyData = new HistoryData;
    await historyData.loadData()
    try
    {
        let statisticsResponse = await fetch('/statistics');
        statisticsData = await statisticsResponse.json();
    }
    catch(err)
    {
        console.log("fetching data from /statistics was unsuccessful")
        console.log("Error message: "+ err)
    }
    console.log(statisticsData)
    console.log(historyData.data)
    //create a HistoryItemsTEmplateEngine and generate the rendered htmls for technical and legislation pages 
    let historyEngine = new HistoryTemplateEngine(historyData.data);
    //historyEngine.enginOperator() returns an object of two elements. First element is the technology data and the second is the legislation data.
    renderedHTMLContainer = await historyEngine.enginOperator();
    //this engin is used for rendering an html for the main element of statistics page
    statisticsEngine = new StatisticsTemplateEngine(statisticsData);
    //statisticsEngine.enginOperator() returns a text as the rendered HTML for the statistics page
    renderedHTMLContainer["statistics"] = await statisticsEngine.enginOperator()
    saleLineChart = new LineChart(statisticsData["eCommerce"],"Spectator sports","industry" ,"year", "salesType","line");//(data,selectedCategory,categories,labels,legends,type)
    crimeDoughnutChart = new DoughnutChart(statisticsData["cyberCrime"], "Canada", "geo","violation",null,"doughnut", "2025");//(data,selectedCategory,categories,labels,legends,type, selectedYear)
    crimeBarChart = new BarChart(statisticsData["cyberCrime"], "Total, all violations", "violation", "geo", "year",'bar');//(data,selectedCategory,categories,labels,legends,type)
    internetPolarChart = new PolarChart(statisticsData["internetUse"], "Canada", "geo","age","age" ,"polarArea");//(data,selectedCategory,categories,labels,legends,type)
    internetLineChart = new LineChart(statisticsData["internetUse"], "Canada", "geo","year", "age","line");//(data,selectedCategory,categories,labels,legends,type)                         

    //embed the rendered html in the main element of the technology page 
    let mainElement = document.querySelector("body>main");
    mainElement.innerHTML = renderedHTMLContainer["technology"];
    //generate a vis-timeline and insert it in the page
    let visContainer = document.getElementById("visualization"); 
    historyTimeline = new HistoryTimeline(historyData.data, "100%", "100%");
    historyTimeline.loadTimeilne("technology",visContainer)
    
    menuEventListeners();
    //for start it add event listeners to the first page
    vistimelineEventlisteners("technology");
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
statisticsData
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
    let timelineButton = document.getElementById("timeline_button")
    if(targetCategory === "statistics")
    {
        timelineButton.classList.remove("active");
    }
    else if (!timelineButton.classList.contains("active") )
    {
        timelineButton.classList.add("active");
    }
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
            vistimelineEventlisteners(targetCategory);
            break;
        case "statistics":
                loadStatisticsCharts();
    }

}
//add event listeners to the components in the main element(which are loaded by template engines)
function vistimelineEventlisteners(category)
{
    let timelineButton = document.querySelector(".timeline_button");
    timelineButton.addEventListener("click", ()=>{
            document.querySelector("#visualization").scrollIntoView({behavior: "smooth"})
        })
    
}
//this function holds the execution for 5000 seconds
function hold()
{
    return new Promise((resolve)=>{setTimeout(resolve, 5000)})
}
function loadStatisticsCharts()
{
        let saleLineContainer = document.getElementById("sale_chart");
        saleLineChart.makeChart(saleLineContainer);
        let crimeBarContainer = document.getElementById("crime_chart_bar");
        crimeBarChart.makeChart(crimeBarContainer);
        let lineInternetUseContainer = document.getElementById("internet_line_chart");
        internetLineChart.makeChart(lineInternetUseContainer);
        let polarInternetUseContainer = document.getElementById("internet_polar_chart");
        internetPolarChart.makeChart(polarInternetUseContainer);
        let crimeDoughnutContainer = document.getElementById("crime_chart_doughnut")
        crimeDoughnutChart.makeChart(crimeDoughnutContainer);
}


