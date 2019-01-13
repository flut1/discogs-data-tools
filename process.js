const argv = require('./argv');


// const bigXml = require("big-xml");
// const listings = require("./listings");

// (async function() {
//   const list = await listings.fetchFileListing('data/2018/');
//   console.log(listings.parseFileNames(list));
// })();
//
// const reader = bigXml.createReader(
//   "data/20190101/discogs_20190101_labels.xml",
//   /^label$/,
//   { gzip: false }
// );
//
// let count = 1;
// reader.on("record", function(record) {
//   // console.log(JSON.stringify(record, null, "  "));
//   count++;
//   if (count > 100) {
//     reader.pause();
//   }
// });
