// class ErrorHandler extends Error {
//     constructor(message, statusCode) {
//       super(message);
//       this.statusCode = statusCode;
  
//       Error.captureStackTrace(this, this.constructor);
//     }
//   }
  
//   module.exports = ErrorHandler;  

class ErrorHandler extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
