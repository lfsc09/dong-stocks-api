import { NextFunction, Request, Response } from 'express';

// Middleware to allow requisitions to this API
const configCORS = (request: Request, response: Response, next: NextFunction) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
};

export { configCORS };
