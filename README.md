# News API

## Link to Hosted Version

https://nc-news-2yza.onrender.com/api

## Project Summary

This is an API that simulates the backend service used on a news/article website. It is written using JavaScript, Node.js, Express.js, and uses PostgreSQL as a database. Endpoint testing is done using Jest and SuperTest. It supplies the following information:

1. `articles`

   - shows a collection of articles
   - shows a specific article, when an article id is given
   - updates the vote count for a specific article
   - posts a new article
   - deletes an existing article

2. `topics`

   - shows a collection of topics
   - posts a new topic

3. `comments`

   - shows a collection of comments for a specific article
   - posts a new comment to a specific article
   - deletes an existing comment
   - updates the vote count for a specific comment

4. `users`
   - shows a collection of users
   - shows a specific user, when a username is given

## Instructions

1. Fork and clone this repository.

2. After cloning, you will need to create two .env files: `.env.test` and `.env.development`.

3. In each .env file, type in `PGDATABASE=<database_name_here>`, with the correct database name for each file. The database names can be found in `setup.sql`.

4. Make sure that the .env files are .gitignored.

5. Install dependencies by running `npm install` in your terminal.

6. Setup the development and test databases by running the following scripts:

   - `npm run setup-dbs` - creates the development and test databases
   - `npm run seed` - seeds the database
   - `npm run dev` - allows for your local server to listen out for requests

7. Make requests by using an API client, such as [Insomnia](https://insomnia.rest/download), or you can open up your browser and type in `localhost:9090/[insert path here]`. The available endpoints can be found in `endpoints.json` or [here](https://nc-news-2yza.onrender.com/api).

8. Run `npm test` to run all tests.

## Minimum Requirements

```
node: v19.1.0
postgres: 8.7.3
```
