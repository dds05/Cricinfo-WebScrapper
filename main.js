
let req=require("request");
let ch=require("cheerio");
let fs=require("fs");
let xlsx = require("xlsx");
let path = require("path");
const { parseHTML } = require("cheerio");
const { fstat } = require("fs");
const { dir } = require("console");

//req('https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard',cb);

function processMatch(url) {
    req(url, cb);

}

console.log("request send");

function cb(error, response, data)
{
    if(response.statusCode==404)
    {
    console.log("Page not found");
    }

    else if(response.statusCode==200)
    {
        parseHTml(data);
    }
    else{
        console.log(err);
    }
}

function parseHTml(data)
{
   let ftool=ch.load(data);
   let ele=ftool(".Collapsible");
   
   let full="";
   for(let i=0;i<ele.length;i++)
   {
       let inningele=ch(ele[i]);
       let teamname=inningele.find("h5").text();
        let fixedtname=teamname.split("INNINGS");
        teamname=fixedtname[0].trim();
        
        
        
        let playerrows=inningele.find(".table.batsman tbody tr");
        


        for(let j=0;j<playerrows.length-1;j++)
        {
            let colen=ch(playerrows[j]).find("td").length;
            let cols=ch(playerrows[j]).find("td");
            if(colen>1)
            {
                let playerName = ch(cols[0]).text().trim();
                let runs = ch(cols[2]).text().trim();
                let balls = ch(cols[3]).text().trim();
                let fours = ch(cols[5]).text().trim();
                let sixes = ch(cols[6]).text().trim();
                let sr = ch(cols[7]).text().trim();
                /*console.log(`${playerName} played for ${teamname} and scored ${runs} runs in ${balls} balls with SR : ${sr}`)*/
              
                processPlayer(playerName, runs, balls, sixes, fours, sr, teamname);
            }
        }
    }
}
   



   function processPlayer(playerName, runs, balls, sixes, fours, sr, teamname)
   {

    let playerObject = {
        playerName: playerName,
        runs: runs,
        balls: balls, sixes,
        fours: fours,
        sr: sr, teamname
    }
      

    // check existence (folder check)
   let direxist=checkExistence(teamname);
   if(direxist)
   {

   }
   else{
       createfolder(teamname);
   }

   let playerEntries = [];
   let playerFileName = path.join(__dirname, teamname, playerName + ".xlsx");
   // file check
   let filexist=checkExistence(playerFileName);
   if(filexist)
   {
      //let bdata=fs.readFileSync(playerFileName);
      let JSONdata=excelReader(playerFileName,playerName);
      playerEntries = JSONdata;
        playerEntries.push(playerObject);
        excelWriter(playerFileName, playerEntries, playerName);

      //playerEntries=JSON.parse(bdata);  
      //fs.writeFileSync(playerFileName, JSON.stringify(playerEntries));
     
   }
   else{
    playerEntries.push(playerObject);
    //fs.writeFileSync(playerFileName, JSON.stringify(playerEntries));
    excelWriter(playerFileName, playerEntries, playerName);
   }
   

   
}


function checkExistence(teamname)
{
    return fs.existsSync(teamname);
}

function createfolder(teamname)
{
  fs.mkdirSync(teamname);   
}
   



function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return null;
    } else {
        // workbook => excel
        let wt = xlsx.readFile(filePath);
        // csk -> msd
        // get data from workbook
        let excelData = wt.Sheets[name];
        // convert excel format to json => array of obj
        let ans = xlsx.utils.sheet_to_json(excelData);
        // console.log(ans);
        return ans;
    }
}

function excelWriter(filePath, json, name) {
    // console.log(xlsx.readFile(filePath));
    let newWB = xlsx.utils.book_new();
    // console.log(json);
    let newWS = xlsx.utils.json_to_sheet(json);
    // msd.xlsx-> msd
    xlsx.utils.book_append_sheet(newWB, newWS, name);  //workbook name as param
    //   file => create , replace
    xlsx.writeFile(newWB, filePath);
}
module.exports = {
    pm: processMatch
}