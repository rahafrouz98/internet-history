
import {getCoordinateForInternetUse} from "./statcanAPI/coordinate.js";
import {getInternetUseData} from "./statcanAPI/dataEndPoints.js";

document.addEventListener("DOMContentLoaded", async()=>{
    let h1 = document.querySelector("body h1")
    h1.innerHTML = "JavaScript is working"
    let coordinate = await getCoordinateForInternetUse("Nova Scotia", "15 to 24 years")
    console.log(coordinate);
    let data = await getInternetUseData(coordinate);
    console.log(data);
    
})

