import { body } from 'express-validator';

const authenticateHandleData = () => {
    return [body('username').trim().not().isEmpty(), body('password').trim().not().isEmpty()];
};

export { authenticateHandleData };
