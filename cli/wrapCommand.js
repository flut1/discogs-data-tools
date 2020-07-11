const wrapCommand = (commandName, commandFn) => async (argv) => {
  try {
    await commandFn(argv);
  } catch (e) {
    console.log(`Command ${commandName} failed with error:
  ${e.message}
  ${e.stack.replace(/\n/g, "\n  ")}`);
  }
};

module.exports = wrapCommand;
