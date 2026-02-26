//https://expressjs.com/en/resources/middleware/cors.html
//begining node.js
//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//https://www.geeksforgeeks.org/web-tech/express-js-express-json-function/

let express = require('express');
//core is used in case the client side is running in different port
let cors = require('cors');
//this module provides a function to cache the meta data of target ed cubes at the start of the running the server
let {cacheMetaData} = require("./server_module/metadata.js")
//this module provides functions to extract the coordinates
let {getCoordinateForCyberCrime,getCoordinateForInternetUse, getCoordinateForECommerce} = require("./server_module/coordinate.js");
//this module profides function to extract actual datafrom the cubes based on the provided coordinate
let {extractDataFromCube} = require("./server_module/statcan_endpoint.js");


//this async function is created to cache the metadata from the statcan API and after it is resolved the server starts.
async function startServer()
{
    try 
    {
        await cacheMetaData();
    }
    catch(err)
    {
        console.error(err);
    }
    let app = express();
    app.use(cors());
    app.use(express.json())
    //__dirname is a global variable and returns the absolute path of the directory that the server.js file is actually in it.
    //express.static is providing access to the files in the folders without the need to specify their path in a serparate get request. So they
    //can be accessed by app.use('/') directly.
    app.use('/public', express.static(__dirname + '/public'))

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/public/html/index.html');
    })
  
    app.post('/ecommerce', async function (req, res) {
        let reqBody = req.body;
        let coordinateObj = getCoordinateForECommerce(reqBody["industry"], reqBody["sales"])
        try
        {
            let data = await extractDataFromCube(coordinateObj);
            res.json(data[0]["object"]["vectorDataPoint"]);
        }
        catch(err)
        {
            console.error(err);
            res.status(500).json({error: err.message});
        }
    })
    app.post('/internetuse', async function (req, res) {
        let reqBody = req.body;
        let coordinateObj = getCoordinateForInternetUse(reqBody["geo"], reqBody["agegroup"])
        try
        {
            data = await extractDataFromCube(coordinateObj);
            res.json(data[0]["object"]["vectorDataPoint"]);
        }
        catch(err)
        {
            console.error(err);
            res.status(500).json({error: err.message});
        }
    })
    app.post('/cibercrime', async function (req, res) {
        let reqBody = req.body;
        let coordinateObj = getCoordinateForCyberCrime(reqBody["geo"], reqBody["violation"],reqBody["statistic"],reqBody["calendarquarter"])
        try
        {
            data = await extractDataFromCube(coordinateObj);
            res.json(data[0]["object"]["vectorDataPoint"]);
        }
        catch(err)
        {
            console.error(err);
            res.status(500).json({error: err.message});
        }
    })

    app.listen(3000, function () {
    console.log('web server listening on port 3000')
    })
}
startServer()