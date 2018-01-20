PET template is a backend JavaScript open-source solution, which provides a solid starting point for [TypeORM](http://www.typeorm.io/), [Node.js](http://www.nodejs.org/), [Express](http://expressjs.com/), and [Passport](http://www.passportjs.org/) based applications. The goal of this project is to provide a reliable, stable, feature complete backend server that is easy to pickup and start developing for without being reliant on the front-end. 

## Before You Begin
Before you begin we recommend you read about the basic building blocks that assemble a PET application:
* TypeORM - Go through [TypeORM Official Website](http://typeorm.io/). This should help you understand how TypeORM interfaces with your choice of SQL database
* Express - The best way to understand express is through its [Official Website](http://expressjs.com/), which has a [Getting Started](http://expressjs.com/starter/installing.html) guide, as well as an [ExpressJS](http://expressjs.com/en/guide/routing.html) guide for general express topics. You can also go through this [StackOverflow Thread](http://stackoverflow.com/questions/8144214/learning-express-for-node-js) for more resources.
* Passport  - Passport's [Official Website](http://www.passportjs.org/) is a great starting point. You can find their documentation [at this location](http://www.passportjs.org/docs/).
* Node.js - Start by going through [Node.js Official Website](http://nodejs.org/) and this [StackOverflow Thread](http://stackoverflow.com/questions/2353818/how-do-i-get-started-with-node-js), which should get you going with the Node.js platform in no time.


## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Git - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager. If you encounter any problems, you can also use this [GitHub Gist](https://gist.github.com/isaacs/579814) to install Node.js.
* Your choice of SQL (and, in some cases, NoSQL) server - TypeORM supports the following databases: 
  * [MySQL](https://www.mysql.com)
  * [PostgreSQL](https://www.postgresql.org)
  * [MariaDB](https://mariadb.org)
  * [SQLite](https://sqlite.org)
  * [Cordova/PhoneGap sqlite storage plugin](https://github.com/litehelpers/Cordova-sqlite-storage)
  * [Oracle SQL](http://www.oracle.com/technetwork/developer-tools/sql-developer/overview/index.html)
  * [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-2016)
  * [websql](https://www.npmjs.com/package/websql)
  * [MongoDB](https://www.mongodb.com)
  * [sql.js](https://github.com/kripken/sql.js/)
* You'll need to download the respective database, install it, and change your configuration file to match the database you've chosen. The default the project is configued for it PostgreSQL; more on that later.

## Downloading PET
There are several ways you can get the PET boilerplate:

### Cloning The GitHub Repository
The recommended way to get MEAN.js is to use git to directly clone the MEAN.JS repository:

```bash
$ git clone https://github.com/crutchcorn/pet-template.git pet-template
```

This will clone the latest version of the MEAN.JS repository to a **meanjs** folder.

### Downloading The Repository Zip File
Another way to use the PET boilerplate is to download a zip copy from the [master branch on GitHub](https://github.com/crutchcorn/pet-template/archive/master.zip). You can also do this using the `wget` command:

```bash
$ wget https://github.com/crutchcorn/pet-template/archive/master.zip -O pet-template.zip; unzip pet-template.zip; rm pet-template.zip
```

Don't forget to rename **pet-template-master** after your project name.

## Quick Install
Once you've downloaded the boilerplate and installed all the prerequisites, you're just a few steps away from starting to develop your PET application.

The boilerplate comes pre-bundled with a `package.json`  file that contain the list of modules you need to start your application.

To install the dependencies, run this in the application folder from the command-line:

```bash
$ npm install
```

This command does a few things:
* First it will install the dependencies needed for the application to run.
* If you're running in a development environment, it will then also install development dependencies needed for testing and running your application.
* To update these packages later on, just run `npm update`

### TypeORM CLI

In order to speed up development (by having generators for subscribers and such) and to manually update your database schema and such, you should install TypeORM's CLI tool. To do so, run the following command:

```bash
$ npm install -g typeorm
```

To see the following commands that you can use with this CLI, simply run the help command:
```bash
$ typeorm -h
```

### Configuration

The configuration file for your database (TypeORM's configuration) can be found at [ormconfig.json](./ormconfig.json). To see the changes you can make to this file for your project, please refer to the [TypeORM documentation](http://typeorm.io/#/connection-options)

## Running Your Application

Run your application using npm:

```bash
$ npm start
```

Your application should run on port 3000 with the *development* environment configuration, so in your browser just go to [http://localhost:3000/api/posts](http://localhost:3000/api/posts) 

That's it! Your application should be running and you should see an empty array. To proceed with your development, check the other sections in this documentation.
If you encounter any problems, try the Troubleshooting section.

Explore `config/env/development.js` for development environment configuration options.

### Running in Production mode
To run your application with *production* environment configuration:

```bash
$ npm run start:prod
```

Explore `config/env/production.js` for production environment configuration options.

### Running with TLS (SSL)
Application will start by default with secure configuration (SSL mode) turned on and listen on port 8443.
To run your application in a secure manner you'll need to use OpenSSL and generate a set of self-signed certificates. Unix-based users can use the following command:

```bash
$ npm run generate-ssl-certs
```

Windows users can follow instructions found [here](http://www.websense.com/support/article/kbarticle/How-to-use-OpenSSL-and-Microsoft-Certification-Authority).
After you've generated the key and certificate, place them in the *config/sslcerts* folder.

Finally, execute prod task `npm run start:prod`
* enable/disable SSL mode in production environment change the `secure` option in `config/env/production.js`

## Getting Started With PET
You have your application running, but there is a lot of stuff to understand. Because most of the server structure is similar to (read: copied directly from) MEAN.JS, we recommend you go over the [Official Documentation](http://meanjs.org/docs.html).
While a fair amount of the docs discusses the frontend aspects of the app and MongoDB specific things, everything relating to Express, folder structure, and more all apply to this project as well.

## Credits
Much of the code is directly ported from the good people at the [MEAN.JS](https://github.com/meanjs/mean)
As a result, the code is inspired by the great work of [Madhusudhan Srinivasa](https://github.com/madhums/)

## License
[The MIT License](LICENSE.md)
