import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const authenticateUser = (request: Request, response: Response, next: NextFunction) => {
    const dataErrors = validationResult(request);
    if (!dataErrors.isEmpty()) {
        const error = new Error('Validation Failed');
        error['statusCode'] = 422;
        error.data = dataErrors.array();
        throw error;
    }
    const data = request.body;
};

export { authenticateUser };
