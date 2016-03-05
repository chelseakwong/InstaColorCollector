// Chelsea Kwong
// First grab colors in all photos, hash them
// Then put them in heap, get the top 30 colors
// call by "node grabColors.js n", where n is an event name, same folder you saved
// images to

var ColorThief = require('color-thief'); //get colors from image
var Heap = require('heap'); //heap to sort quickly
var eventName = ""; //folder name
var masterPath = "./"
var driveDir = "directory containing the directories of images";
var filesystem = require("fs");

var numColors = 100; //how many top colors

// Get a list of file names
function getTopColors(){
    eventName = process.argv[2];
        var hash;
        try{
            hash = createHash(_getAllFilesFromFolder((driveDir+eventName),eventName));
        }catch(err){
            var newDriveDir = "another place where you might've saved images"
            hash = createHash(_getAllFilesFromFolder((newDriveDir+eventName),eventName));
        }
        // take all hash results and create elements
        var elements = hashToElements(hash);
        // then take all from hash and create min heap of 30, heap in array form
        var heap = createHeap(elements);
        var top30Results = JSON.stringify(heap, null, '\t');
        var exportFile = masterPath+eventName+'_colors.json';
        filesystem.writeFile(exportFile, top30Results, function(err){
            if (err){
                console.log("oops in exportFilters: " + err);
            }
        });

        console.log("exported top 100 colors to "+exportFile);
}

// create hash from list of colors
function createHash(files){
    console.log("extracting colors and creating hash table for"+files.length+" files...")
    var dict = {};
    var colorThief = new ColorThief();

    var countFile = 0;
    // iterate through files and get their colors
    for (var i = 0; i < files.length; i++){
        var fileName = files[i];
        // colors = [[num, num, num], [num, num, num], ... ]
        try{
            var colors = colorThief.getPalette(fileName,12);
        }catch(err){
            continue;
        }

        if (!(countFile % 100)){
            // if multiple of 100 then show
            console.log("..."+countFile);
            // console.log("   "+colors);
            console.log("dict has "+Object.keys(dict).length);
        }

        // DEBUG, STOPS IT FROM DOING ALL IMAGES IN DIR
        // if (countFile == 200) break;

        // put each color in hashtable
        for (var j = 0; j<colors.length; j++){
            var luma = 0.2126 * colors[j][0] + 0.7152 * colors[j][1] +
                        0.0722 * colors[j][2]; // per ITU-R BT.709

            //if too dark then skip
            if (luma < 30) continue;

            var hex = rgbToHex(colors[j][0], colors[j][1], colors[j][2]);

            if (hex in dict){
                // update count
                var num = dict[hex];
                num++;
                dict[hex] = num;
            }
            else{
                // create new entry
                dict[hex] = 1;
            }
        }
        countFile ++;
    }
    console.log("hash table created!")
    return dict; //the entire hashtable
}

// convert hashtable to array of elements
function hashToElements(hashTable){
    console.log("converting hash table to array of elements");
    var elements = [];
    for (var key in hashTable){
        if (hashTable.hasOwnProperty(key)){
            var c = hashTable[key];
            var newElement = {color:key, count:c};
            elements.push(newElement);
        }
    }
    console.log("created list of elements!");
    return elements;
}

// use heap to get top N elements with custom sorting function
function createHeap(elements){
    console.log("creating heap from elements, sorting");
    // heap to sort elements, who have attributes color and count
    // var heap = new Heap(function(a,b){
    //     return a.count - b.count;
    // });
    var top30Colors = Heap.nlargest(elements,numColors, function(a,b){
        return a.count - b.count;
    });
    var jsonFormat = {};
    jsonFormat.colors = top30Colors;
    return jsonFormat;
}

// Get hex of num
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// get hex from rgb
function rgbToHex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Getting an array of files from folder
var _getAllFilesFromFolder = function(dir) {
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    console.log(results[0]);
    return results;

};

getTopColors();
