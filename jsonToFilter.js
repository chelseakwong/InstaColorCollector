// Use when manually terminate process, this function takes
// json files and export all filter info to another json file

function parseToFilter(){
    var fs = require("fs");
    var results = [];
    var masterPath = '/Volumes/CHELSEANIKE/igcolorsplaces/';
    var placeName = "HiroshimaAtomBombDome";
    dir = masterPath+placeName+'_meta';
    fs.readdirSync(dir).forEach(function(file) {

       file = dir+'/'+file;
       var stat = fs.statSync(file);

       if (stat && stat.isDirectory()) {
           results = results.concat(_getAllFilesFromFolder(file))
       } else results.push(file);

   });

   // var filters = []

   console.log(results);

   for (var i = 0; i < results.length; i++){
       filename = results[i];
       if (filename){
           fs.readFile(filename, 'utf8', function (err, data){
               if (err){
                   throw err;
               }
               obj = JSON.parse(data);
           });
       }
   }
}

parseToFilter();
