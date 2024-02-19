import { Router } from 'express';

const router = Router();

/*****************
 * PRIVATE ROUTES
 *****************/
router.post('/{:id_user}/edit');

export default router;
