import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

// Middleware to allow requisitions to this API
const MW_configCORS = (request: Request, response: Response, next: NextFunction): void => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
};

const MW_handleAsyncError = (error: any, request: Request, response: Response, next: NextFunction): void => {
    console.error(error);
    response.status(error?.statusCode ?? 500).json({ message: error?.message ?? 'Unknown error..' });
};

export { MW_configCORS, MW_handleAsyncError };
