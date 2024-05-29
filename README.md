## Initial Setup and Requirements

#### File Structure

</br>

#### Env files and variables

Also the only two states are `development` and `production`, both in undercased.

###### .Env file

The enviroment file `.env` will follow the example of `.env.sample` which must be at the root folder.

This .env file will only be used for the `development` scripts, and are configured at the execution in `nodemon.json`.

###### For production

The enviroment for production will be configured in the PM2 server module, as parameters to the server call initialization.

## Project code

#### Clean Architecture

This project will follow the guidelines for a `Clean Architecture` project, with `DDD`, and following `SOLID` principles.

#### Tests

Unit and Enviroment Tests are done with the use of `Jest`.