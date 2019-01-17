const { verify } = require("../verify");

module.exports = function(argv) {
  verify(argv["dump-version"], argv["types"], argv["data-dir"]).catch(e =>
    console.error(e)
  );
};
