# RESTful API for book coffee application


## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the server in [http://localhost:3000](http://localhost:3000)

### `npm run dev`
Runs the authentication server in [http://localhost:5000](http://localhost:5000)

### `npm run beautify`
Run prettier

## Available api
**Note: If api return, it will be json type**

### Authentication Server API
[http://localhost:5000/login](http://localhost:5000/login): POST method to return access token and refresh token if authentication\
[http://localhost:5000/logout](http://localhost:5000/logout): POST method delete refresh token in db\
[http://localhost:5000/token](http://localhost:5000/token): POST method to return new access token and refresh token when access token expire\

### Customer API
[http://localhost:3000/api/customer/search?title=](http://localhost:3000/api/customer/search): GET method to search book by title\
[http://localhost:3000/api/customer/branchInfo](http://localhost:3000/api/customer/branchInfo): GET method to get all branch information\
[http://localhost:3000/api/customer/bookofbranch?address=Land mark 81](http://localhost:3000/api/customer/bookofbranch?address=Land%20mark%2081): GET method to get all book of a branch by branch address\
[http://localhost:3000/api/customer/reservation](http://localhost:3000/api/customer/reservation): POST method to create reservation by address, quantity, date (YYYY-MM-DD hh:mm:ss)\
[http://localhost:3000/api/customer/meeting](http://localhost:3000/api/customer/meeting): POST method to create meeting by address, name, date (YYYY-MM-DD hh:mm:ss), description\




