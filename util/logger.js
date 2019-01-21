const ora = require("ora");

let spinner = null;
let muted = false;

function startSpinner() {
  if (!spinner) {
    spinner = ora();
  }

  if (!muted) {
    spinner.start();
  }
}

function stopSpinner() {
  if (spinner) {
    spinner.stop();
    spinner = null;
  }
}

function mute() {
  muted = true;
}

function log(mssg) {
  if (!muted) {
    if (spinner) {
      spinner.info(mssg).start();
    } else {
      console.log(mssg);
    }
  }
}

function succeed(mssg) {
  if (!muted) {
    if (spinner) {
      spinner.succeed(mssg).start();
    } else {
      console.log(mssg);
    }
  }
}

function error(mssg) {
  if (!muted) {
    if (spinner) {
      spinner.fail(mssg).start();
    } else {
      console.error(mssg);
    }
  }
}

function warn(mssg) {
  if (!muted) {
    if (spinner) {
      spinner.warn(mssg).start();
    } else {
      console.warn(mssg);
    }
  }
}

function status(mssg, fallbackLog = false) {
  if (!muted) {
    if (spinner) {
      spinner.text = mssg;
    } else if (fallbackLog) {
      console.log(mssg);
    }
  }
}

module.exports = { log, warn, error, mute, startSpinner, stopSpinner, status, succeed };
