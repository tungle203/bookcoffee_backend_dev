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

[http://localhost:5000/login](http://localhost:5000/login): return access token and refresh token if authentication\
[http://localhost:5000/logout](http://localhost:5000/logout): delete refresh token in db\
[http://localhost:5000/token](http://localhost:5000/token): return new access token and refresh token when access token expire
