//this source inspired to use data-*attribute to have a js file shared between multip;e pages:
//https://stackoverflow.com/questions/8410298/one-js-file-for-multiple-pages. 
//https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes

import {getCoordinateForECommerce,getCoordinateForCyberCrime,getCoordinateForInternetUse} from "./statcan/coordinate.js";
import {getdataeData} from "./statcan/data_endpoints.js";
import {createTimeline} from "./timeline/timeline.js";
import { HistoryItemsTemplateEngine} from "./template_engine.js";

document.addEventListener("DOMContentLoaded", async()=>{
    let tEngine = new HistoryItemsTemplateEngine();
    let historyContainersHTML = await tEngine.enginOperator();
    console.log(historyContainersHTML)
    let historyElement = document.getElementById("body")
    historyElement.innerHTML = historyContainersHTML[0];

   
    let internetUseCoordinate = await getCoordinateForInternetUse("Nova Scotia", "15 to 24 years")
    let cyberCrimeCoordinate = await getCoordinateForCyberCrime("Canada", "Total, all violations", "Quarterly data", "Q1")
    let eCommerceCoordinate = await getCoordinateForECommerce("Canada", "Spectator sports", "Total sales")
    //console.log(internetUseCoordinate);
    // console.log(cyberCrimeCoordinate);
    // console.log(eCommerceCoordinate);
    // let internetUseData = await getdataeData(internetUseCoordinate, "internetUse");
    // let cyberCrimeData = await getdataeData(cyberCrimeCoordinate, "cyberCrime");
    // let eCommerceData = await getdataeData(eCommerceCoordinate, "eCommerce");
    // console.log(internetUseData);
    // console.log(cyberCrimeData);
    // console.log(eCommerceData);
    
   let container = document.getElementById("visualization");
   createTimeline(container);
})