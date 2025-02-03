# Codemate Backend Core Service

<!-- ![codemate](./public/images/logo.png) -->

---

## Requirements

For development, you will only need Node.js and a node global package, npm, installed in your environment.

### Node

- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
  Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install pnpm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v20.16.0

If you need to update `pnpm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install pnpm -g

## Getting Started

    $ git clone [GIT_PATH]
    $ cd PROJECT_TITLE
    $ pnpm install

## Configure app

Create .env file and add relevant key and values as shared separately along with code

## Running the project

    $ pnpm start

## API Document endpoints

- swagger-ui-mobile Endpoint : http://localhost:3000/api-docs/v1/web-mobile

- swagger-ui-web Endpoint : http://localhost:3000/api-docs/v1/admin

## Database migrations CMD

To generate migration

    $ npx sequelize-cli migration:generate --name fileName

To create migration

    $ npx sequelize-cli migration:create --name fileName

TO run migration

    $ npx sequelize-cli db:migrate

## Database seeder CMD

To generate seeder

    $ npx sequelize-cli seed:generate --name fileName

To create seeder

    $ npx sequelize-cli seed:create --name fileName

TO run seeder

    $ npx sequelize-cli db:seed:all