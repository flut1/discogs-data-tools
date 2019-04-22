import ora from 'ora';

let spinner = null;
let muted = false;

export function startSpinner() {
  if (!spinner) {
    spinner = ora();
  }

  if (!muted) {
    spinner.start();
  }
}

export function stopSpinner() {
  if (spinner) {
    spinner.stop();
    spinner = null;
  }
}

export function mute() {
  muted = true;
}

export function log(mssg) {
  if (!muted) {
    if (spinner) {
      spinner.info(mssg).start();
    } else {
      console.log(mssg);
    }
  }
}

export function succeed(mssg) {
  if (!muted) {
    if (spinner) {
      spinner.succeed(mssg).start();
    } else {
      console.log(mssg);
    }
  }
}

export function error(mssg) {
  if (!muted) {
    if (spinner) {
      spinner.fail(mssg).start();
    } else {
      console.error(mssg);
    }
  }
}

export function warn(mssg) {
  if (!muted) {
    if (spinner) {
      spinner.warn(mssg).start();
    } else {
      console.warn(mssg);
    }
  }
}

export function status(mssg, fallbackLog = false) {
  if (!muted) {
    if (spinner) {
      spinner.text = mssg;
    } else if (fallbackLog) {
      console.log(mssg);
    }
  }
}
