const path = require('path');
const { globDumps } = require('../dataManager');

module.exports = async function ls(argv) {
  const results = Object.entries(await globDumps(argv['data-dir']));

  if (!results.length) {
    console.log(`No data found at ${argv['data-dir']}`);
  } else {
    for (const [version, data] of results) {
      const versionMatch = version.match(/^(\d{4})(\d{2})(\d{2})$/);
      if (versionMatch) {
        console.log([versionMatch[1], versionMatch[2], versionMatch[3]].join('-'));
      } else {
        console.log(version);
      }

      for (const [type, file] of Object.entries(data)) {
        console.log(` - ${type.toLowerCase()}: ${path.join(argv['data-dir'], file)}`);
      }
      console.log('\n');
    }
  }
};
