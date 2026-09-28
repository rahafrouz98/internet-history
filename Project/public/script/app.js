//This is the main javaScript code that is referenced from index.HTML and all other modules in the client side will
//be initiated from this files
import { HistoryTimeline } from "./timeline.js";
import { HistoryData } from "./historydata.js";
import { HistoryTemplateEngine } from "./history_template_engine.js";
import { StatisticsTemplateEngine } from "./statistics_template_engine.js";
import { BarChart } from "./charts/bar_chart.js";
import { LineChart } from "./charts/line_chart.js";
import { PolarChart } from "./charts/polar_chart.js";
import { DoughnutChart } from "./charts/doughnut_chart.js";
import { ContributeDialog } from "./contribute_dialog.js";
let renderedHTMLContainer = {};
let historyTimeline = null;
let saleLineChart = null;
let crimeBarChart = null;
let crimeDoughnutChart = null;
let internetLineChart = null;
let statisticsEngine = null;
let internetPolarChart = null;
let historyData = null;
let statisticsData = null;
let contributeDialog = null;

document.addEventListener("DOMContentLoaded", async () => {
    await initializ();
});

async function initializ() {


    /*#######################################################  loading data from the server ####################################################*/

    //load history and statistics data with Promise.all() to decrease delays
    historyData = new HistoryData();
    await historyData.loadData();
    try {
        let statisticsResponse = await fetch("/statistics");
        statisticsData = await statisticsResponse.json();
    } catch (err) {
        console.log("fetching data from /statistics was unsuccessful");
        console.log("Error message: " + err);
    }

    /*######################################################### create template engines #################################################### */

    //create a HistoryItemsTEmplateEngine and generate the rendered htmls for technical and legislation pages
    let historyEngine = new HistoryTemplateEngine(historyData.data);

    //this engine is used for rendering an html for the main element of statistics page
    let statisticsEngine = new StatisticsTemplateEngine(statisticsData);

    /*#######################################################  render HTML components  ######################################################*/

    //historyEngine.enginOperator() returns an object of two elements. First element is the technology html and the second is the legislation html.
    renderedHTMLContainer = await historyEngine.enginOperator();
    //statisticsEngine.enginOperator() returns a text as the rendered HTML for the statistics page
    renderedHTMLContainer["statistics"] = await statisticsEngine.enginOperator();
    //loads the html for the contribute dialog
    try {
        let response = await fetch("/public/html/templates/contribute_dialog.html");
        renderedHTMLContainer["contributeDialog"] = await response.text();
    } catch (err) {
        console.log("fetching the html for dialog box was unsuccessful");
    }
    /*######################################################### creating charts and timelines  ##########################################*/
    saleLineChart = new LineChart(
        statisticsData["eCommerce"],
        "Spectator sports",
        "industry",
        "year",
        "salesType",
        "line",
    ); //(data,selectedCategory,categories,labels,legends,type)
    crimeDoughnutChart = new DoughnutChart(
        statisticsData["cyberCrime"],
        "Canada",
        "geo",
        "violation",
        null,
        "doughnut",
        "2025",
    ); //(data,selectedCategory,categories,labels,legends,type, selectedYear)
    crimeBarChart = new BarChart(
        statisticsData["cyberCrime"],
        "Total, all violations",
        "violation",
        "geo",
        "year",
        "bar",
    ); //(data,selectedCategory,categories,labels,legends,type)
    internetPolarChart = new PolarChart(statisticsData["internetUse"], "Canada", "geo", "age", "age", "polarArea"); //(data,selectedCategory,categories,labels,legends,type)
    internetLineChart = new LineChart(statisticsData["internetUse"], "Canada", "geo", "year", "age", "line"); //(data,selectedCategory,categories,labels,legends,type)

    historyTimeline = new HistoryTimeline(historyData.data, "100%", "100%");

    /** ######################################################### html components and event listeners ####################################### */
    //embed the rendered html in the main element of the technology page
    let mainElement = document.querySelector("body>main");
    mainElement.innerHTML = renderedHTMLContainer["technology"];
    document.getElementById("technology").classList.add("selected");
    //generate a vis-timeline and insert it in the page
    let visContainer = document.getElementById("visualization");
    historyTimeline.loadTimeilne("technology", visContainer);
    //create contribute dialog
    let shareButton = document.getElementById("share_content");
    let dialogDiv = document.getElementById("contribute");
    contributeDialog = new ContributeDialog(renderedHTMLContainer["contributeDialog"], dialogDiv, shareButton);

    //setup the eventlisteners
    menuEventListeners();
}

function menuEventListeners() {
    //add events to the menue options
    let body = document.body;
    let bodyCategory = document.body.dataset.category;

    let technologyButton = document.getElementById("technology");
    technologyButton.addEventListener("click", (event) => {
        document.getElementById("technology").classList.add("selected");
        document.getElementById("legislation").classList.remove("selected");
        document.getElementById("statistics").classList.remove("selected");
        loadContents("technology", event.currentTarget);
    });

    let legislationButton = document.getElementById("legislation");
    legislationButton.addEventListener("click", (event) => {
        document.getElementById("technology").classList.remove("selected");
        document.getElementById("legislation").classList.add("selected");
        document.getElementById("statistics").classList.remove("selected");
        loadContents("legislation", event.currentTarget);
    });

    let statisticsButton = document.getElementById("statistics");
    statisticsButton.addEventListener("click", (event) => {
        document.getElementById("technology").classList.remove("selected");
        document.getElementById("legislation").classList.remove("selected");
        document.getElementById("statistics").classList.add("selected");
        loadContents("statistics", event.currentTarget);
    });
    let timelineButton = document.querySelector("#timeline_button");
    timelineButton.addEventListener("click", () => {
        document.querySelector("#visualization").scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

//load and update the contents of the target page
function loadContents(targetCategory) {
    //update the content of the menu and general elements for all pages
    let body = document.body;
    let activeCategory = document.body.dataset.category;
    if (activeCategory == targetCategory) {
        return;
    }
    body.dataset.category = targetCategory;
    let targetMain = document.querySelector("body>main");
    targetMain.innerHTML = renderedHTMLContainer[targetCategory];

    let timelineButton = document.getElementById("timeline_button");
    if (targetCategory === "statistics") {
        timelineButton.classList.remove("active");
    } else {
        //make the timeline button vissible
        timelineButton.classList.add("active");
        //update the elements for the contribute button
        let shareButton = document.getElementById("share_content");
        let dialogDiv = document.getElementById("contribute");
        contributeDialog.initializeElements(renderedHTMLContainer["contributeDialog"], dialogDiv, shareButton);
    }

    //update the specific contents (loaded by template engine) of each page
    switch (targetCategory) {
        case "technology":
        case "legislation":
            let visContainer = document.getElementById("visualization");
            historyTimeline.loadTimeilne(targetCategory, visContainer);
            break;
        case "statistics":
            loadStatisticsCharts();
    }
}

function loadStatisticsCharts() {
    let saleLineContainer = document.getElementById("sale_chart");
    saleLineChart.makeChart(saleLineContainer);
    let crimeBarContainer = document.getElementById("crime_chart_bar");
    crimeBarChart.makeChart(crimeBarContainer);
    let lineInternetUseContainer = document.getElementById("internet_line_chart");
    internetLineChart.makeChart(lineInternetUseContainer);
    let polarInternetUseContainer = document.getElementById("internet_polar_chart");
    internetPolarChart.makeChart(polarInternetUseContainer);
    let crimeDoughnutContainer = document.getElementById("crime_chart_doughnut");
    crimeDoughnutChart.makeChart(crimeDoughnutContainer);
}
