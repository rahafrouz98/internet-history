let express = require("express");
//core is used in case the client side is running in different ports
let cors = require("cors");
//module for reading and writing files
let fs = require("fs");
//provides module for createing unique file names for the uploaded images
let uniqueFilename = require("unique-filename");
//this module is used to extract the file's name from the path
let path = require("path");
//this module extracts and cache the metadata
let coordinateFinder = require("./server_modules/coordinate_finder.js");

const { supabase, saveContributedData } = require("./server_modules/supabase");

const requireAuth = require("./server_modules/requireAuth.js");

const { notifyContribution } = require("./server_modules/mailer");

//these are child instances of DataEngine to extract data from statcan api endpoint construct data in the format of json and cache them in json files and memory
//cached files will be used instead of the data in the memory if statcan api was not available
let eCommerceDataEngine = require("./server_modules/ecommerce_data_engine.js");
let internetUseEngine = require("./server_modules/internet_data_engine.js");
let cyberCrimeDataEngine = require("./server_modules/cybercrime_data_engine.js");

//this async function is created to cache the metadata from the statcan API and after it is resolved the server starts.
async function startServer() {
    console.log("Data is being loaded from Statcan . . . ");
    let statcanData = {
        internetUse: {},
        cyberCrime: {},
        eCommerce: {},
    };
    try {
        await coordinateFinder.cacheMetaData();
        [statcanData["internetUse"], statcanData["eCommerce"], statcanData["cyberCrime"]] = await Promise.all([
            internetUseEngine.loadData(),
            eCommerceDataEngine.loadData(),
            cyberCrimeDataEngine.loadData(),
        ]);
        console.log("Data is loaded and ready. ");
    } catch (err) {
        console.error(err);
    }
    let app = express();
    app.use(cors());
    app.use(express.json({ limit: "10Mb" }));
    //__dirname is a global variable and returns the absolute path of the directory that the server.js file is actually in it.
    //express.static is providing access to the files in the folders without the need to specify their path in a serparate get request. So they
    //can be accessed by app.use('/') directly.
    app.use("/public", express.static(__dirname + "/public"));

    app.get("/", function (req, res) {
        res.sendFile(__dirname + "/public/html/index.html");
    });
    app.get("/history", async function (req, res) {
        try {
            const [technologyResult, legislationResult] = await Promise.all([
                supabase.from("technology").select("data").eq("review", "approved").order("created_at").order("id"),

                supabase.from("legislation").select("data").eq("review", "approved").order("created_at").order("id"),
            ]);

            if (technologyResult.error) {
                throw technologyResult.error;
            }

            if (legislationResult.error) {
                throw legislationResult.error;
            }

            res.json({
                technology: technologyResult.data.map((row) => row.data),
                legislation: legislationResult.data.map((row) => row.data),
            });
        } catch (error) {
            console.error("Error at /history:", error);
            res.status(500).json({
                error: "Unable to load history.",
            });
        }
    });

    app.get("/statistics", function (req, res) {
        try {
            res.json(statcanData);
        } catch (err) {
            console.error("error at /statistics: " + err);
            res.status(500).json({ error: err.message });
        }
    });
    app.post("/contribute", requireAuth, async function (req, res) {
        let data = req.body;
        data.contributer_email = req.user.email;
        //convert images from base64 to binary and save them in the local storage and record their addresses in the data
        for (let image of data["images"]) {
            if (typeof image.image_file === "string" && image.image_file.startsWith("data:")) {
                let base64 = image["image_file"];
                //creates a unique file name
                let imageUniqePathName = uniqueFilename(__dirname + "/public/assets/images/history");
                imageUniqePathName += ".png";
                //saves the image in the folder with the unique file name
                cacheImage(imageUniqePathName, base64);
                //record the file address in the data and delete the base64 format of image
                let fileName = path.basename(imageUniqePathName);
                image["address"] = "/public/assets/images/history/" + fileName;
                delete image["image_file"];
            }
        }
        // requireAuth has already verified this header.
        const token = req.get("Authorization").split(/\s+/)[1];

        try {
            await saveContributedData(data, req.user.id, token);
        } catch (error) {
            console.error("Contribution saving failed:", error);

            return res.status(500).json({
                error: "Unable to save your contribution.",
            });
        }

        try {
            await notifyContribution({
                ...data,
                email: req.user.email,
                userId: req.user.id,
            });
        } catch (error) {
            console.error("Contribution saved, but email notification failed:", error.message);
        }

        res.send("Thank you. Your contribution is waiting for review.");
    });

    app.get("/api/account", requireAuth, (req, res) => {
        res.json({
            id: req.user.id,
            email: req.user.email,
        });
    });

    app.listen(3000, function () {
        console.log("web server listening on port 3000");
    });
}
startServer();
//this converets base64 to buffer and saves it in the folder
function cacheImage(savingPath, base64Data) {
    let matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer = Buffer.from(matches[2], "base64");
    fs.writeFileSync(savingPath, buffer);
}
