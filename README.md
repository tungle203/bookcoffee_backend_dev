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
[http://localhost:5000/login](http://localhost:5000/login): POST method to return access token, refresh token and user_name to authentication by user_name, password
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTY5OTQxODk0NSwiZXhwIjoxNjk5NDI2MTQ1fQ.p0kSsupC3S5sbk7_hzvybqQUA7VM0EiMaYRDRhcu2GM",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTY5OTQxODk0NSwiZXhwIjoxNjk5NDIyNTQ1fQ.Mo401XZg6XWeOEEO-QJ7_mhLtxzrJmFpb66_Ph5EsRo",
    "user_name": "tungle123"
}
```
[http://localhost:5000/logout](http://localhost:5000/logout): POST method delete refresh token in db\
[http://localhost:5000/token](http://localhost:5000/token): POST method to return new access token and refresh token when access token expire\
[http://localhost:5000/signup](http://localhost:5000/signup): POST method to sign up new account by user_name, password, email, address

### _Customer API_
[http://localhost:3000/api/customer/search?title=](http://localhost:3000/api/customer/search): GET method to search book by title
```json
[
    {
        "title": "Anna Karenina",
        "author_name": "Lev Tolstoy",
        "genre": null,
        "publication_year": null,
        "branch": [
            "KTX B DHQG",
            "Land mark 81"
        ]
    },
    {
        "title": "Junkie Hell",
        "author_name": "Dante Alighier",
        "genre": null,
        "publication_year": null,
        "branch": [
            "KTX B DHQG",
            "Land mark 81"
        ]
    }
]
```
[http://localhost:3000/api/customer/branchInfo](http://localhost:3000/api/customer/branchInfo): GET method to get all branch information
```json
[
  {
    "address": "KTX B DHQG",
    "working_time": null,
    "user_name": "tungle23",
    "email": null
  },
  {
    "address": "Land mark 81",
    "working_time": null,
    "user_name": "tungle23",
    "email": null
  }
]
```
[http://localhost:3000/api/customer/bookofbranch?address=Land%20mark%2081](http://localhost:3000/api/customer/bookofbranch?address=Land%20mark%2081): GET method to get all book of a branch by branch address
```json
[
  {
    "title": "The Double",
    "author_name": "Fyodor Dostoevsky",
    "genre": null,
    "publication_year": null
  },
  {
    "title": "Junkie Hell",
    "author_name": "Dante Alighier",
    "genre": null,
    "publication_year": null
  }
]
```
[http://localhost:3000/api/customer/reservation](http://localhost:3000/api/customer/reservation): POST method to create reservation by address, quantity, date (format YYYY-MM-DD hh:mm:ss)\
[http://localhost:3000/api/customer/meeting](http://localhost:3000/api/customer/meeting): POST method to create meeting by address, name, date (format YYYY-MM-DD hh:mm:ss), description

### _Staff API_
### _Manager API_
### _Admin API_


