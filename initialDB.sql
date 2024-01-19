--drop database DAHTTT WITH( FORCE );
--
--create database DAHTTT;
--
--select current_database(); 

DROP TABLE IF EXISTS _AUTHORS, _USER, _BRANCH, _WORK_ON, _BOOK, _BOOK_COPY, _RESERVATIONS,
 _BORROW_BOOK_TO_GO, _BORROW_BOOK_AT_BRANCH, _MEETINGS, _DRINKS, _DRINKS_SIZE, _BILL, _DRINKS_BILL;

drop type if exists roleEnum CASCADE;

CREATE TABLE _AUTHORS (
	authorId SERIAL PRIMARY KEY,
    authorName VARCHAR(255) NOT NULL UNIQUE,
    bornDate DATE,
    createdDate TIMESTAMP DEFAULT current_timestamp
);

CREATE TYPE roleEnum AS ENUM('customer','staff', 'manager', 'admin');

CREATE TABLE _USER (
	userId SERIAL PRIMARY KEY,
    userName VARCHAR(20) UNIQUE,
	password VARCHAR(20),
    email VARCHAR(40),
    address VARCHAR(255),
    phoneNumber VARCHAR(255),
    avatar VARCHAR(255) DEFAULT 'default-avatar.jpg',
    role roleEnum DEFAULT 'customer',
    disable BOOL DEFAULT false,
    refreshToken VARCHAR(255),
    createdDate TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE _BRANCH (
	branchId SERIAL PRIMARY KEY,
    address VARCHAR(255),
    workingTime VARCHAR(255),
    image VARCHAR(255),
    managerId INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (managerId) REFERENCES _USER(userId)
);

CREATE TABLE _WORK_ON (
    staffId INT,
    branchId INT,
    workingDate DATE DEFAULT (current_date),
    createdDate TIMESTAMP DEFAULT current_timestamp,
    PRIMARY KEY (staffId, branchId),
    FOREIGN KEY (staffId) REFERENCES _USER(userId),
    FOREIGN KEY (branchId) REFERENCES _BRANCH(branchId)
);

CREATE TABLE _BOOK (
	bookId SERIAL PRIMARY KEY,
    title VARCHAR(255),
    genre VARCHAR(255) DEFAULT 'Lãng mạn',
    publicationYear VARCHAR(4),
    salePrice INT,
    authorId INT,
    image VARCHAR(255),
    description TEXT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (authorId) REFERENCES _AUTHORS(authorId)
);

CREATE TABLE _BOOK_COPY (
	copyId SERIAL PRIMARY KEY,
    branchId INT,
    bookId INT,
    isBorrowed BOOL DEFAULT false,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (branchId) REFERENCES _BRANCH(branchId),
    FOREIGN KEY (bookId) REFERENCES _BOOK(bookId)
);


CREATE TABLE _RESERVATIONS (
	reservationId SERIAL PRIMARY KEY,
    quantity INT,
    branchId INT,
    userId INT,
    reservationDate TIMESTAMP,
    confirmDate TIMESTAMP,
    isConfirm BOOL DEFAULT false,
    staffId INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (branchId) REFERENCES _BRANCH(branchId),
    FOREIGN KEY (userId) REFERENCES _USER(userId),
    FOREIGN KEY (staffId) REFERENCES _USER(userId)
);

CREATE TABLE _BORROW_BOOK_TO_GO (
	borrowingId SERIAL PRIMARY KEY,
    userId INT,
    copyId INT,
    staffId INT,
    branchId INT,
    confirmStaff INT,
    deposit INT,
    isReturn BOOL DEFAULT false,
    borrowDate TIMESTAMP DEFAULT current_timestamp,
    returnDate TIMESTAMP,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (userId) REFERENCES _USER(userId),
    FOREIGN KEY (staffId) REFERENCES _USER(userId),
    FOREIGN KEY (confirmStaff) REFERENCES _USER(userId),
    FOREIGN KEY (branchId) REFERENCES _BRANCH(branchId),
    FOREIGN KEY (copyId) REFERENCES _BOOK_COPY(copyId)
);

CREATE FUNCTION update_deposit() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
BEGIN
  NEW.deposit := (SELECT b.salePrice FROM _BOOK_COPY AS bc 
                  JOIN _BOOK as b 
                  on b.bookId = bc.bookId
                  WHERE bc.copyId = NEW.copyId) / 2;
  RETURN NEW;
END;
$$

CREATE TRIGGER update_deposit_trigger
BEFORE INSERT ON _BORROW_BOOK_TO_GO
FOR EACH ROW
EXECUTE PROCEDURE update_deposit();



CREATE TABLE _BORROW_BOOK_AT_BRANCH (
	borrowingId SERIAL PRIMARY KEY,
    copyId INT,
    staffId INT,
    branchId INT,
    confirmStaff INT,
    customerName VARCHAR(255),
    citizenId VARCHAR(12),
    phoneNumber VARCHAR(10),
    address VARCHAR(255),
    isReturn BOOL DEFAULT false,
    borrowDate TIMESTAMP DEFAULT current_timestamp,
    returnDate TIMESTAMP,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (staffId) REFERENCES _USER(userId),
    FOREIGN KEY (copyId) REFERENCES _BOOK_COPY(copyId),
    FOREIGN KEY (confirmStaff) REFERENCES _USER(userId),
    FOREIGN KEY (branchId) REFERENCES _BRANCH(branchId)
  );

CREATE FUNCTION update_returnDate() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
BEGIN
  NEW.returnDate := TIMESTAMPADD(HOUR, 4, CURRENT_TIMESTAMP);
  UPDATE _BOOK_COPY SET isBorrowed = TRUE WHERE copyId = NEW.copyId;
  RETURN NEW;
END;
$$

CREATE TRIGGER update_returnDate_trigger
BEFORE INSERT ON _BORROW_BOOK_AT_BRANCH
FOR EACH ROW
EXECUTE PROCEDURE update_returnDate();


CREATE TABLE _MEETINGS (
	meetingId SERIAL PRIMARY KEY,
    meetingName VARCHAR(255),
    meetingDate TIMESTAMP,
	description VARCHAR(255),
    hostId INT,
    branchId INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (hostId) REFERENCES _USER(userId),
    FOREIGN KEY (branchId) REFERENCES _BRANCH(branchId)
);

CREATE TABLE _DRINKS (
	drinksId SERIAL PRIMARY KEY,
    drinksName VARCHAR(255),
    image VARCHAR(255),
    createdDate TIMESTAMP DEFAULT current_timestamp
);

drop type if exists sizeEnum CASCADE;

CREATE TYPE sizeEnum AS ENUM('S', 'M', 'L');

CREATE TABLE _DRINKS_SIZE (
	drinksId INT,
    size sizeEnum,
    price INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    PRIMARY KEY (drinksId, size),
    FOREIGN KEY (drinksId) REFERENCES _DRINKS(drinksId)
);

CREATE TABLE _BILL (
	billId SERIAL PRIMARY KEY,
    staffId INT,
    branchId INT,
    price INT DEFAULT 0,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (staffId) REFERENCES _USER(userId),
    FOREIGN KEY (branchId) REFERENCES _BRANCH(branchId)
);

CREATE TABLE _DRINKS_BILL (
	billId INT,
	drinksId INT,
    size sizeEnum,
    count INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    PRIMARY KEY (billId, drinksId, size),
	FOREIGN KEY (billId) REFERENCES _BILL(billId),
	FOREIGN KEY (drinksId, size) REFERENCES _DRINKS_SIZE(drinksId, size)
);


CREATE FUNCTION update_price_bill() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
BEGIN
	UPDATE _BILL SET price = price + NEW.count * (SELECT price FROM _DRINKS_SIZE 
 												WHERE drinksId = NEW.drinksId AND size = NEW.size) 
	WHERE billId = NEW.billId;
  RETURN NEW;
END;
$$

CREATE TRIGGER update_price_bill_trigger
AFTER INSERT ON _DRINKS_BILL
FOR EACH ROW
EXECUTE PROCEDURE update_price_bill();