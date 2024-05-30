# Northcoders News API

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)

## Hosted version

Here's a link to the hosted version
[Click here](https://news-api-y9rq.onrender.com)

## Summary

This project is a built API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service similar to Reddit, which provides this information to the front end. This API is designed to handle requests and responses efficiently, providing endpoints for various data operations. Finally, it uses PostgreSQL to manage and query data to ensure reliable storage of data.

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Please ensure you have the following installed:

- Node.js (version: 21.7.3 or higher)
- PostgreSQL (version: 14.11 or higher)

### Installation

1. **Clone the Repository**

```
git clone https://github.com/daviddd-21/News-API.git
cd be-nc-news
```

2. **Install dependencies**

```
npm install
```

3. **Create environment variables**

Create two `.env` files in the root directory of the project: `.env.development` and `.env.test`.

**.env.development**

Set the database for the development by adding:

```
PGDATABASE=nc_news
```

**.env.test**

Set the database for the test by adding:

```
PGDATABASE=nc_news_test
```

4. **Set up databases**

```
npm run setup-dbs
```

5. **Seed Local Database**

```
npm run seed
```

6. **Run Tests**

```
npm test
```
