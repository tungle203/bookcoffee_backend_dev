drop database DAHTTT; 

create database DAHTTT;

use DAHTTT;

CREATE TABLE AUTHOR (
	authorId INT AUTO_INCREMENT PRIMARY KEY,
    authorName VARCHAR(255) NOT NULL UNIQUE,
    bornDate DATE,
    createdDate TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE USER (
	userId INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(20) UNIQUE,
	password VARCHAR(20),
    email VARCHAR(40),
    address VARCHAR(255),
    avatar VARCHAR(255),
    role enum('customer','staff', 'manager', 'admin') DEFAULT 'customer',
    disable BOOL DEFAULT false,
    refreshToken VARCHAR(255),
    createdDate TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE BRANCH (
	branchId INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255),
    workingTime VARCHAR(255),
    image VARCHAR(255),
    managerId INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (managerId) REFERENCES USER(userId)
);

CREATE TABLE WORK_ON (
    staffId INT,
    branchId INT,
    workingDate DATE DEFAULT (current_date),
    createdDate TIMESTAMP DEFAULT current_timestamp,
    PRIMARY KEY (staffId, branchId),
    FOREIGN KEY (staffId) REFERENCES USER(userId),
    FOREIGN KEY (branchId) REFERENCES BRANCH(branchId)
);

CREATE TABLE BOOK (
	bookId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    genre VARCHAR(255),
    publicationYear VARCHAR(4),
    salePrice INT,
    authorId INT,
    image VARCHAR(255),
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (authorId) REFERENCES AUTHOR(authorId)
);

CREATE TABLE BOOK_COPY (
	copyId INT AUTO_INCREMENT PRIMARY KEY,
    branchId INT,
    bookId INT,
    isBorrowed BOOL DEFAULT false,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (branchId) REFERENCES BRANCH(branchId),
    FOREIGN KEY (bookId) REFERENCES BOOK(bookId)
);


CREATE TABLE RESERVATIONS (
	reservationId INT AUTO_INCREMENT PRIMARY KEY,
    quantity INT,
    branchId INT,
    userId INT,
    reservationDate TIMESTAMP,
    isConfirm BOOL DEFAULT false,
    staffId INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (branchId) REFERENCES BRANCH(branchId),
    FOREIGN KEY (userId) REFERENCES USER(userId),
    FOREIGN KEY (staffId) REFERENCES USER(userId)
);

CREATE TABLE BORROW_BOOK_TO_GO (
	borrowingId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    copyId INT,
    staffId INT,
    deposit INT,
    isReturn BOOL DEFAULT false,
    borrowDate TIMESTAMP DEFAULT current_timestamp,
    returnDate TIMESTAMP,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (userId) REFERENCES USER(userId),
    FOREIGN KEY (staffId) REFERENCES USER(userId),
    FOREIGN KEY (copyId) REFERENCES BOOK_COPY(copyId)
);

DELIMITER //
CREATE TRIGGER update_deposit BEFORE INSERT ON BORROW_BOOK_TO_GO
FOR EACH ROW
BEGIN
    SET NEW.deposit = 	(SELECT b.salePrice FROM BOOK_COPY AS bc 
   						JOIN BOOK as b 
   						WHERE b.bookId = bc.bookId AND bc.copyId = NEW.copyId) / 2;
END;
//
DELIMITER ;

CREATE TABLE BORROW_BOOK_AT_BRANCH (
	borrowingId INT AUTO_INCREMENT PRIMARY KEY,
    copyId INT,
    staffId INT,
    customerName VARCHAR(255),
    citizenId VARCHAR(12),
    phoneNumber VARCHAR(10),
    address VARCHAR(255),
    isReturn BOOL DEFAULT false,
    borrowDate TIMESTAMP DEFAULT current_timestamp,
    returnDate TIMESTAMP,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (staffId) REFERENCES USER(userId),
    FOREIGN KEY (copyId) REFERENCES BOOK_COPY(copyId)
);

DELIMITER //
CREATE TRIGGER update_returnDate BEFORE INSERT ON BORROW_BOOK_AT_BRANCH
FOR EACH ROW
BEGIN
    SET NEW.returnDate = TIMESTAMPADD(HOUR, 4, CURRENT_TIMESTAMP());
   	UPDATE BOOK_COPY SET isBorrowed = TRUE WHERE copyId = NEW.copyId;
END;
//
DELIMITER ;


CREATE TABLE MEETINGS (
	meetingId INT AUTO_INCREMENT PRIMARY KEY,
    meetingName VARCHAR(255),
    meetingDate TIMESTAMP,
	description VARCHAR(255),
    hostId INT,
    branchId INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (hostId) REFERENCES USER(userId),
    FOREIGN KEY (branchId) REFERENCES BRANCH(branchId)
);

CREATE TABLE DRINKS (
	drinksId INT AUTO_INCREMENT PRIMARY KEY,
    drinksName VARCHAR(255),
    image VARCHAR(255),
    createdDate TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE DRINKS_SIZE (
	drinksId INT,
    size enum('S', 'M', 'L'),
    price INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    PRIMARY KEY (drinksId, size),
    FOREIGN KEY (drinksId) REFERENCES DRINKS(drinksId)
);

CREATE TABLE BILL (
	billId INT AUTO_INCREMENT PRIMARY KEY,
    staffId INT,
    branchId INT,
    price INT DEFAULT 0,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (staffId) REFERENCES USER(userId),
    FOREIGN KEY (branchId) REFERENCES BRANCH(branchId)
);

CREATE TABLE DRINKS_BILL (
	billId INT,
	drinksId INT,
    size enum('S', 'M', 'L'),
    count INT,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    PRIMARY KEY (billId, drinksId, size),
	FOREIGN KEY (billId) REFERENCES BILL(billId),
	FOREIGN KEY (drinksId, size) REFERENCES DRINKS_SIZE(drinksId, size)
);

DELIMITER //
CREATE TRIGGER update_price_bill AFTER INSERT ON DRINKS_BILL
FOR EACH ROW
BEGIN
    UPDATE BILL SET price = price + NEW.count * (SELECT price FROM DRINKS_SIZE WHERE drinksId = NEW.drinksId AND size = NEW.size) WHERE billId = NEW.billId;
END;
//
DELIMITER ;


INSERT INTO AUTHOR(authorName) VALUES ("Fyodor Dostoevsky"), ("Dante Alighier"), ("Lev Tolstoy");
INSERT INTO USER(userName, password, role, avatar) VALUES 	("tungle", "123456", "customer", "coca.jpg"),
													("tungle2", "123456", "staff", "pepsi.jpg"),
                                                    ("tungle23", "123456", "manager", "7up.jpg"),
                                                    ("tungle203", "123456", "admin", "sprite.jpg");
INSERT INTO BRANCH(address, managerId) VALUE ("KTX B DHQG", 3), ("Land mark 81", 3);
INSERT INTO WORK_ON(staffId, branchId) VALUES (2, 1), (3, 1);
INSERT INTO BOOK(title, authorId, salePrice, image) VALUES ("The Double", 1, 50000, 'thedouble.jpg'), ("Junkie Hell", 2, 40000, 'junkiehell.jpg'), ("Anna Karenina", 3, 30000, 'annakarenina.jpg');
INSERT INTO BOOK_COPY(bookId, branchId) VALUES (1, 1), (1,1), (2, 1), (2, 1), (3, 1), (1, 2), (1,2), (2, 2), (2, 2), (3, 2);
INSERT INTO reservations(userId, branchId, quantity, reservationDate)
VALUES (1,1,5, CAST('2023-12-20 12:12:12' AS datetime)),
		(1,2,2, CAST('2023-12-20 12:12:12' AS datetime)),
        (2,1,5, CAST('2023-12-20 12:12:12' AS datetime)),
        (2,2,5, CAST('2023-12-20 12:12:12' AS datetime));
INSERT INTO BORROW_BOOK_TO_GO(userId, copyId, staffId)
VALUES (1,1,2),
		(1,2,2),
        (2,3,2),
        (2,4,2);
INSERT INTO BORROW_BOOK_AT_BRANCH(copyId, staffId, customerName)
VALUES (1,2, 'Tung'),
		(2,2, 'Hoang'),
        (3,2, 'Chuong'),
        (4,2, 'Tuan');
INSERT INTO MEETINGS(meetingName, meetingDate, description, hostId, branchId)
VALUES ("Meeting 1", CAST('2023-12-20 12:12:12' AS datetime), "Meeting 1", 3, 1),
		("Meeting 2", CAST('2023-12-20 12:12:12' AS datetime), "Meeting 2", 3, 1),
        ("Meeting 3", CAST('2023-12-20 12:12:12' AS datetime), "Meeting 3", 3, 1),
        ("Meeting 4", CAST('2023-12-20 12:12:12' AS datetime), "Meeting 4", 3, 1);
INSERT INTO DRINKS(drinksName, image)
VALUES ("Coca", "coca.jpg"),
		("Pepsi", "pepsi.jpg"),
        ("7up", "7up.jpg"),
        ("Sprite", "sprite.jpg");
INSERT INTO DRINKS_SIZE(drinksId, size, price)
VALUES (1, "S", 10000),
		(1, "M", 20000),
        (1, "L", 30000),
        (2, "S", 10000),
		(2, "M", 20000),
        (2, "L", 30000),
        (3, "S", 10000),
		(3, "M", 20000),
        (3, "L", 30000),
        (4, "S", 10000),
		(4, "M", 20000),
        (4, "L", 30000);

INSERT INTO BILL(staffId, branchId)
VALUES (2, 1),
		(2, 1),
        (2, 1),
        (2, 1);
INSERT INTO DRINKS_BILL(billId, drinksId, size, count)
VALUES (1, 1, "S", 1),
		(1, 2, "L", 1),
        (1, 3, "M", 1),
        (1, 4, "S", 1),
        (2, 1, "L", 1),
		(2, 2, "S", 1),
        (2, 3, "M", 1),
        (2, 4, "M", 1),
        (3, 1, "S", 1),
		(3, 2, "L", 1),
        (3, 3, "M", 1),
        (4, 1, "S", 1),
		(4, 2, "S", 1),
        (4, 3, "M", 1),
        (4, 4, "L", 1);