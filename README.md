# RESTful API for book coffee application


## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the server in [http://localhost:4000](http://localhost:4000)

### `npm run auth`
Runs the authentication server in [http://localhost:5000](http://localhost:5000)

### `npm run beautify`
Run prettier

## Available api
**Note: If api return, it will be json type**

### Authentication Server API
[http://localhost:5000/login](http://localhost:5000/login): POST method to return access token, refresh token and userName to authentication by userName, password
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTY5OTQxODk0NSwiZXhwIjoxNjk5NDI2MTQ1fQ.p0kSsupC3S5sbk7_hzvybqQUA7VM0EiMaYRDRhcu2GM",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTY5OTQxODk0NSwiZXhwIjoxNjk5NDIyNTQ1fQ.Mo401XZg6XWeOEEO-QJ7_mhLtxzrJmFpb66_Ph5EsRo",
    "userName": "tungle123",
    "role": "customer"
}
```
[http://localhost:5000/logout](http://localhost:5000/logout): POST method delete refresh token in db\
[http://localhost:5000/token](http://localhost:5000/token): POST method to return new access token and refresh token when access token expire\
[http://localhost:5000/signup](http://localhost:5000/signup): POST method to sign up new account by userName, password, email, address

### _Customer API_
[http://localhost:4000/api/customer/search?title=&address=](http://localhost:4000/api/customer/search): GET method to search book by title and address, if no title, method will return all book
```json
[
    {
        "copyId": [
            5,
            10
        ],
        "title": "Anna Karenina",
        "authorName": "Lev Tolstoy",
        "genre": null,
        "publicationYear": null,
        "branch": [
            "KTX B DHQG",
            "Land mark 81"
        ]
    },
    {
        "copyId": [
            4,
            6
        ],
        "title": "Junkie Hell",
        "authorName": "Dante Alighier",
        "genre": null,
        "publicationYear": null,
        "branch": [
            "KTX B DHQG",
            "Land mark 81",
        ]
    }
]
```
[http://localhost:4000/api/customer/branchInfo](http://localhost:4000/api/customer/branchInfo): GET method to get all branch information
```json
[
    {
        "address": "KTX B DHQG",
        "workingTime": null,
        "managerName": "tungle23",
        "email": null
    },
    {
        "address": "Land mark 81",
        "workingTime": null,
        "managerName": "tungle23",
        "email": null
    }
]
```
[http://localhost:4000/api/customer/reservation](http://localhost:4000/api/customer/reservation): POST method to create reservation by address, quantity, date (format YYYY-MM-DD hh:mm:ss)\
[http://localhost:4000/api/customer/meeting](http://localhost:4000/api/customer/meeting): POST method to create meeting by address, name, date (format YYYY-MM-DD hh:mm:ss), description\
[http://localhost:4000/api/customer/showBookBorrowing](http://localhost:4000/api/customer/showBookBorrowing): GET method to show all book borrowed by user\
customer: no res.body\
staff: req.body: userName
```json
[
    {
        "copyId": 1,
        "title": "The Double",
        "borrowing_date": null
    },
    {
        "copyId": 2,
        "title": "The Double",
        "borrowing_date": null
    }
]
```

### _Staff API_
[http://localhost:4000/api/staff/showReservation](http://localhost:4000/api/staff/showReservation): GET method to return all reservation
```json
[
    {
        "reservation_id": 1,
        "userName": "tungle",
        "address": "KTX B DHQG",
        "reservation_date": "2023-12-20T05:12:12.000Z",
        "quantity": 5
    },
    {
        "reservation_id": 2,
        "userName": "tungle",
        "address": "Land mark 81",
        "reservation_date": "2023-12-20T05:12:12.000Z",
        "quantity": 2
    }
]
```
[http://localhost:4000/api/staff/confirmReservation](http://localhost:4000/api/staff/confirmReservation): POST method to confirm the reservation by reservationId\
[http://localhost:4000/api/staff/bookBorrowing](http://localhost:4000/api/staff/bookBorrowing): POST method to create the book borrowing by userName, copyId


### _Manager API_
[http://localhost:4000/api/manager/showStaff?managerId=]: GET method to show Staff by branchId
NOTE: managerId is required

```json
[
    {
        "userId": 2,
        "userName": "tungle2",
        "email": null,
        "workAt": "KTX B DHQG"
    }
]
```
[http://localhost:4000/api/manager/showCustomer?userName=tuan]: GET method to show Customer by userName, if not userName then show all
```json
[
    {
        "userId": 2,
        "userName": "tungle2",
        "email": null,
        "address": null,
        "workAt": "KTX B DHQG"
    }
]
```
localhost:4000/api/manager/addStaff: POST Method
req.body:
{
	"userId": INT,
	"branchId": INT
}
NOTE: get userId and branchId of Staff by showStaff

localhost:4000/api/manager/deleteStaff: DELETE Method
req.body:
{
	"userId": INT,
	"branchId": INT
}
NOTE: get userId and branchId of Staff by showStaff

localhost:4000/api/manager/addBook: POST Method
body:
{
	"bookId": INT,
	"title": varchar, 
	"genre": varchar, 
	"publicationYear": varchar,
	"availableCopies": Int,
	"salePrice": INT,
	"authorId": INT,
}

localhost:4000/api/manager/changeBookinfo: POST Method
body:
{
	"bookId": INT,
	"title": varchar, 
	"genre": varchar, 
	"publicationYear": varchar,
	"availableCopies": Int,
	"salePrice": INT,
	"authorId": INT,
}

localhost:4000/api/manager/addBookCopies: POST Method  -- add number of book copies into branch id
body:
{
	"numCopies": INT,
	"branchId": INT, 
	"bookId": INT, 
}


