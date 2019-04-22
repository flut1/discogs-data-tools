const createExitHandler = (callback = () => {}) => {
  const cleanupHandler = () => {
    try {
      callback();
    } catch (e) {
      console.warn('Error during cleanup callback: ');
      console.warn(e);
    }
  };

  const exitHandler = () => {
    console.log('Performing cleanup callback...');
    process.emit('cleanup');
  };

  const sigIntHandler = () => {
    console.log('\n');
    console.log('Ctrl-C pressed...');
    process.exit(2);
  };

  const uncaughtExceptionHandler = (e) => {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
  };

  process.on('cleanup', cleanupHandler);
  process.on('exit', exitHandler);
  process.on('SIGINT', sigIntHandler);
  process.on('uncaughtException', uncaughtExceptionHandler);

  return () => {
    process.off('cleanup', cleanupHandler);
    process.off('exit', exitHandler);
    process.off('SIGINT', sigIntHandler);
    process.off('uncaughtException', uncaughtExceptionHandler);
  }
};

export default createExitHandler;
