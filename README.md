# RESTful API for Book Coffee Application ☕

This API powers the backend functionality for the Book Coffee application, enabling users to seamlessly manage their coffee orders.

## Key Features

* Comprehensive API endpoints for managing coffee orders, user accounts, and more.
* Authentication server for secure user access.
* Clear and concise documentation for easy integration.
* Built with Node.js, Express, and MySQL for a robust and efficient backend experience.

## Available Scripts

To streamline development and maintenance, the following scripts are available:

### `npm start`

Launches the application in development mode, starting both the main server and authentication server concurrently.

- **Main server:** Accessible at [http://localhost:4000](http://localhost:4000)
- **Authentication server:** Accessible at [http://localhost:5000](http://localhost:5000)

### `npm run beautify`

Maintains code readability and consistency by automatically formatting code using Prettier.

## Available API Endpoints

Explore the full range of API endpoints and their usage in the interactive Postman documentation:

- **Postman documentation:** Link to Postman documentation: [https://documenter.getpostman.com/view/29642210/2s9YsT79GW](https://documenter.getpostman.com/view/29642210/2s9YsT79GW)

## Technology Stack

- **Node.js:** JavaScript runtime environment for building scalable server-side applications.
- **Express:** Minimalist and flexible Node.js web application framework.
- **MySQL:** Open-source relational database management system for data storage and management.

## Security

This API uses JSON Web Tokens (JWT) for authentication. To access protected endpoints, you must provide a valid JWT token in the Authorization header of your requests.

## Get Started
- Clone the repository: `git clone https://github.com/tungle203/bookcoffee_backend_dev.git`
- Initialize mySQL database by *initialDB.sql* file
- Install dependencies: `npm install`
- Start the development server: `npm start`
- Explore the API using Postman or your preferred tool.