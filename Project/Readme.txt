server.js need to be executed and it takes some time to download data from the Statcan for the statistics page. Then It is ready for the requests from the browser.
If Statcan was not available, server will upload the latest cached data from the cached folder.
Data for technology and legislation page is in-house built and saved in the database folder.
required installed npm packages:  
4-npm install express 
5-npm install cors
7-npm install unique-filename

Project Structure:

Project/
       |server.js
       |package.json
       |package-lock.json
       |readme.txt
       |node_modules/
       |server_modules/
                      |cached/
                      |      |cyber_crime.json
                      |      |e_commerce.json    
                      |      |internet_use.json
                      |      |meta.json
                      |
                      |
       |public/
              |assets/
              |      |images/
              |      |      |history/
              |      |        
              |      |-logo.png
              |
              |
              |-css/
              |    |vis_lib/
              |    |desktop_screen.css
              |    |phone_screen.css
              |    |tablet_screen.css
              |     
	      |html/
              |     |templates/
              |     |         |contribute_dialog.html
              |     |         |history_template.html
              |     |         |statistics_template.html                  
              |     |
              |     |index.html
              |
              |script/
                     |chart_lib/
                     |vis_lib/
                     |charts/
                     |      |bar_chart.js
                     |      |doughnut_chart.js
                     |      |line_chart.js
                     |      |polar_chart.js
                     | 
                     |app.js
                     |contribute_dialog.js
                     |history_template_engine.js
                     |historydata.js
                     |statistics_template_engine.js
                     |timeline.js 