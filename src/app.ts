import express from 'express';
import { MW_configCORS, MW_handleAsyncError } from './Middlewares';
import AuthRoutes from './routes/AuthRoutes';
import UserRoutes from './routes/UserRoutes';

const app = express();

/*****************
 * CONFIGURE CORS
 *****************/
app.use(MW_configCORS);

/*********************
 * AUTHENTICATE ROUTE
 *********************/
app.use(AuthRoutes);

/**************
 * USER ROUTES
 **************/
app.use('/user', UserRoutes);

/********************
 * GRAB ASYNC ERRORS
 ********************/
app.use(MW_handleAsyncError);

app.listen(69);
