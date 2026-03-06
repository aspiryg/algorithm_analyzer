// Wraps async route handlers so we don't repeat try/catch everywhere.
// Just wrap your controller: router.get('/', catchAsync(myController))

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
