// queryig.js
// **** UPDATED BY CHELSEA KWONG TO USE NEW NPM PACKAGE
//
// grabs instagram images and metadata within a date range with a specific tag
//
// r. luke dubois
// nyu tandon school of engineering
// dubois@nyu.edu
// 6.15

process.setMaxListeners(0); // set max throttle

// libraries
var ig = require('instagram-node').instagram();
var https = require('https');
var fs = require('fs');
var mkdirp = require('mkdirp');
var bn = require('bignumber.js');
var urlencode = require('urlencode');
var utf8 = require('utf8');
var exports = module.exports = {};
var masterPath = '/Volumes/CHELSEANIKE/igcolorsplaces/';

/*

    MODIFY FOR EACH DIFFERENT LOCATION

*/
// what are you searching for?

var searchTerm = 'hiroshima';
var lat = 34.3955;
var long = 132.4537;
var placeName = "hiroshimabombdome";


// Date(year, month, day, hours, minutes, seconds, milliseconds);

// noon and 1pm on january 1, 2015
// months are 0 based (0-11), days are NOT (1-31), hours are 24-hour

// this is the earliest image you want to download:
var startDate = Math.floor(new Date(2015, 7, 6, 0, 0, 0, 0).getTime()/1000.);
// this is the latest image you want to download:
var endDate = Math.floor(new Date(2015, 7, 6, 23, 59, 0, 0).getTime()/1000.);
// (the downloading will happen backwards - endDate to startDate)


/* END MODIFICATION */
var mt; // max tag for recursion

var absminID, absmaxID; // lowest and highest ID to search for

var metadata = {};

var filters = {};

var countDownloaded = 0;
var queryMaxLength = 10000;

metadata.images = new Array();
filters.allNames = new Array();

// print shit to feel good:
console.log("start date: " + startDate);
console.log("end date: " + endDate);

exports.startProcess = function(at){
    // at should be string
    ig.use({ access_token: '199926498.fc50c91.812dcf2241614c309297ae1b47a4a7fc' });
    getMinID(); // START IT GOING
}


// getMinID() - find the instagram ID # of the
// instagram user at the mall in thailand
// closest in time to startDate.
//
// that value will be stashed in absminID.
//
// then it will fire getMaxID().

// FIELDS OF OBJ IN MEDIA
// attribution
// tags
// type
// location
// comments
// filter
// created_time
// link
// likes
// images
// users_in_photo
// caption
// user_has_liked
// id
// user
function getMinID()
{
  ig.media_search(lat, long, {
    min_timestamp: startDate-(60*60*24),
    max_timestamp: startDate,
    distance: 1000},
    function(err, medias, remaining, limit){
      console.log("get min ID complete");
      console.log("err: "+err);
      console.log("medias = "+medias);
      obj = medias[0];
      for (obj in medias){
          if (obj.images){
              console.log(String(obj.images.low_resolution.url));
          }
      }
      console.log("limit = "+limit);
      absminID = new bn(medias[0].id.split('_')[0]); // use short form IDs
      getMaxID();
    }
  );
}

// getMaxID() - find the instagram ID # of the
// instagram user at the mall in thailand
// closest in time to endDate.
//
// that value will be stashed in absmaxID.
//
// then it will fire printID().
function getMaxID()
{
  ig.media_search(lat, long, {
    min_timestamp: endDate-(60*60*24),
    max_timestamp: endDate,
    distance: 1000},
    function(err, medias, remaining, limit){
      absmaxID = new bn(medias[0].id.split('_')[0]); // use short form IDs
      printID();
    }
    );
}

// printID()) - prints the instagram IDs that closest
// correspond to startDate and endDate.
//
// it also makes the search string directory.
//
// then it will fire getIG() to start the actual image search.
function printID()
{
  console.log("start ID: " + absminID);
  console.log("end ID: " + absmaxID);

  mkdirp(masterPath+placeName, function(err) {
    // path was created unless there was error
  });
  mkdirp(masterPath+placeName+'_meta', function(err) {
    // path was created unless there was error
  });

  mkdirp(masterPath+placeName+'_filters', function(err){
      //path was created unless there was error
  });

  mt = new bn(absmaxID);
  getIG();
}

// getIG()) - start searching instagram based on
// absmaxID and absminID and the search term ('searchTerm').
//
// it will paginate through automatically, downloading all images
// that fit between startDate and endDate.
//
// when it's done, it will say so and take a while to flush
// while all the download threads have time to finish.
//
// then the app will exit.
function getIG()
{
  ig.tag_media_recent((urlencode(searchTerm)),{
    // name: utf8.encode(searchTerm), // term to search
    // count: 100, // 100 images per page
    max_tag_id: mt.toString()}, // starting ID (based on the bangkok mall)
    function(err, medias, pagination, remaining, limit){
        // console.log(urlencode(searchTerm));
        if (err){
            console.log("err code: "+err.code);
            console.log("err type: "+err.error_type);
            console.log("err message: "+err.error_message);
            console.log("err status code: "+err.status_code);
            // console.log("err body: "+err.body);
        }

        // console.log("medias = "+medias);
        console.log("--------------------");
        console.log("downloaded : "+countDownloaded);
        console.log("remaining : "+remaining);

    //   console.log("highest ID should be: " + mt);
    //   console.log("first ID on page: " + medias[0].id);
      // debug: find out the date of this page:
      var pagedate = new Date(medias[0].created_time*1000);
    //   console.log("page date: " + medias[0].created_time + ". " + pagedate.toUTCString());
      metadata.images = new Array(); // blow out meta every page

      for(var i = 0;i<medias.length;i++){
        var ts = medias[i].created_time;
        if(ts>startDate && ts<endDate) {
          metadata.images.push(medias[i]);
          //console.log(data[i]);
          // only download images between dates:
          var url = medias[i].images.low_resolution.url;
          var filename = url.substring(url.lastIndexOf('/')+1);
          var finalFilename = filename.substr(0,filename.indexOf('jpg')+3);
          var filter = medias[i].filter;
          filters.allNames.push(filter);
          downloadImage(url, finalFilename); // download image
          countDownloaded++;
        }
      }
        // console.log("mt:          " + mt);
        // console.log("min id:      " + absminID);
        // console.log("diff:        " + mt.minus(absminID));
        var next_id = new bn(pagination.next_max_tag_id);
    //   if((countDownloaded > queryMaxLength) ||mt.equals(next_id)
    //         || !pagination.next_max_tag_id || mt.lessThan(absminID)) {
        if (countDownloaded > queryMaxLength){
        console.log("reached end of query");
        writeMeta(mt); // one last time
        exportAllFilters();//export all filter info
        console.log("DONE!!!");
        // will pause to clean up
      }
      else {
        // console.log("saving this page's results");
        writeMeta(mt); // save every page
        mt = new bn(pagination.next_max_tag_id);
        // console.log("continuing to next page....");
        getIG();
      }
    }
    );
}

// downloadImage(_url, _fn) - downloads the image at _url to the
// file in the "stuff" subfolder with the name _fn.
function downloadImage(_url, _fn)
{
        // console.log("downlad url "+_url);
        var request = https.get(_url, function(response) {
          if (response.statusCode === 200) {
            var file = fs.createWriteStream(masterPath+placeName+"/"+_fn);
            response.pipe(file);
          }
          // Add timeout.
          request.setTimeout(12000, function () {
            request.abort();
          });
        });
}

function writeMeta(_mt)
{
  // write file:
  var thestuff = JSON.stringify(metadata, null, '\t');
  // write to the output file in the 'subs' folder:
  var outfile = masterPath+placeName+'_meta/'+mt+'_meta.json';
  fs.writeFile(outfile, thestuff, function (err) {
    //   error handling
    if (err){
        console.log("oops in writeMeta: " + err);
    }
  });

  // console.log("done writing to meta");
}

function exportAllFilters(){
    var fl = JSON.stringify(filters, null, '\t');
    // console.log(filtersLog);
    var exportFile = masterPath+placeName+'_filters/'+'filters.json';
    // console.log("writing to... "+exportFile);
    fs.writeFile(exportFile, fl, function(err){
        if (err){
            console.log("oops in exportFilters: " + err);
        }
    });
    console.log("exported filters!");
    // process.exit();
}
