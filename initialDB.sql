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
    phoneNumber VARCHAR(255),
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
    description VARCHAR(255),
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

INSERT INTO AUTHOR(authorName) VALUES  ("A &amp; E Television Network"),
										("A A Milne"),
										("A Adams"),
										("A Alvarez"),
										("A B Guthrie"),
										("A B Simpson"),
										("A Blue Mountain Arts Collection"),
										("A Bodenburg Sommer"),
										("A Dumas"),
										("A E Hartink"),
										("A E Van Vogt"),
										("A Finlayson"),
										("A First Book"),
										("A Frank"),
										("A Franquin");
									
INSERT INTO BOOK(title, authorId, salePrice, image, publicationYear)
VALUES ("Amelia Earhart: Queen of the Air (Biography Audiobooks)", 1, 50000, '0312956762.01.LZZZZZZZ.jpg', "1998"),
		("John F. Kennedy: A Personal Story (Biography Audiobooks)", 1, 40000, '034545006X.01.LZZZZZZZ.jpg', "1998"),
		("Piglet Meets a Heffalump", 2, 30000, '1579651372.01.LZZZZZZZ.jpg', "1998"),
		("Christopher Robin Gives Pooh a Party", 2, 30000, '1853114103.01.LZZZZZZZ.jpg', "1998"),
		("Kanga and Baby Roo Come to the Forest", 2, 30000, '0736401369.01.LZZZZZZZ.jpg', "1998"),
		("Pooh Goes Visiting and Pooh and Piglet Nearl", 2, 30000, '3426618354.01.LZZZZZZZ.jpg', "2000"),
		("Winnie the Pooh Storybook Treasury", 2, 30000, '2710308932.01.LZZZZZZZ.jpg', "2000"),
		("Annie's Wild Ride", 3, 30000, '3548201814.01.LZZZZZZZ.jpg', "2000"),
		("Hers", 4, 30000, '2020126575.01.LZZZZZZZ.jpg', "2000"),
		("These Thousand Hills", 5, 30000, '2211017312.01.LZZZZZZZ.jpg', "2000"),
		("Big Sky", 5, 30000, '3502517630.01.LZZZZZZZ.jpg', "2002"),
		("Best of A B Simpson", 6, 30000, '3499111802.01.LZZZZZZZ.jpg', "2002"),
		("For a Special Teenager: A Collection of Poems (Teens &amp; Young Adults)", 7, 30000, '2710308932.01.LZZZZZZZ.jpg', "2002"),
		("If You Want to Scare Yourself", 8, 30000, 'annakarenina.jpg', "2002"),
		("Count of Monte Cristo", 9, 30000, '2211017312.01.LZZZZZZZ.jpg', "2002"),
		("Encyclopedia of Pistols and Revolvers", 10, 30000, '0595292364.01.LZZZZZZZ.jpg', "2002"),
		("Encyclopedia of Rifles and Carbines", 10, 30000, '0312956762.01.LZZZZZZZ.jpg', "2003"),
		("Best of a E Van Vogt Volume 2", 11, 30000, '1579651372.01.LZZZZZZZ.jpg', "1995"),
		("Supermind", 11, 30000, 'junkiehell.jpg', "2003"),
		("Card Tricks", 12, 30000, 'annakarenina.jpg', "2003"),
		("OPEN AND SAY", 13, 30000, '3548201814.01.LZZZZZZZ.jpg', "2003"),
		("Journal", 14, 30000, 'thedouble.jpg', "2003"),
		("Le Cas Lagaffe (Gaston Lagaffe)", 15, 30000, 'thedouble.jpg',"2003");
	
INSERT INTO USER(userName, password, email, address, phoneNumber, role, avatar) 
VALUES 	("tung_cus", "123456", "tungcus@gmail.com", "Tây Ninh", "0966288048","customer", "tung.jpg"),
		("tung_staff", "123456", "tungstaff@gmail.com", "Tây Ninh", "0966288048","staff", "tung.jpg"),
		("tung_manager", "123456", "tungmana@gmail.com", "Tây Ninh", "0966288048","manager", "tung.jpg"),
		("tung_admin", "123456", "tungadmin@gmail.com", "Tây Ninh", "0966288048","admin", "tung.jpg"),
		("hoang_cus", "123456", "hoangcus@gmail.com", "Tây Ninh", "0966288048","customer", "hoang.jpg"),
		("hoang_staff", "123456", "hoangstaff@gmail.com", "Tây Ninh", "0966288048","staff", "hoang.jpg"),
		("hoang_manager", "123456", "hoangmana@gmail.com", "Tây Ninh", "0966288048","manager", "hoang.jpg"),
		("hoang_admin", "123456", "hoangadmin@gmail.com", "Tây Ninh", "0966288048","admin", "hoang.jpg"),
		("tuan_cus", "123456", "tuancus@gmail.com", "Tây Ninh", "0966288048","customer", "tuan.jpg"),
		("tuan_staff", "123456", "tuanstaff@gmail.com", "Tây Ninh", "0966288048","staff", "tuan.jpg"),
		("tuan_manager", "123456", "tuanmana@gmail.com", "Tây Ninh", "0966288048","manager", "tuan.jpg"),
		("tuan_admin", "123456", "tuanadmin@gmail.com", "Tây Ninh", "0966288048","admin", "tuan.jpg"),
		("anh_cus", "123456", "anhcus@gmail.com", "Tây Ninh", "0966288048","customer", "anh.jpg"),
		("anh_staff", "123456", "anhstaff@gmail.com", "Tây Ninh", "0966288048","staff", "anh.jpg"),
		("anh_manager", "123456", "anhmana@gmail.com", "Tây Ninh", "0966288048","manager", "anh.jpg"),
		("anh_admin", "123456", "anhadmin@gmail.com", "Tây Ninh", "0966288048","admin", "anh.jpg"),
		("chuong_cus", "123456", "chuongcus@gmail.com", "Tây Ninh", "0966288048","customer", "chuong.jpg"),
		("chuong_staff", "123456", "chuongstaff@gmail.com", "Tây Ninh", "0966288048","staff", "chuong.jpg"),
		("chuong_manager", "123456", "chuongmana@gmail.com", "Tây Ninh", "0966288048","manager", "chuong.jpg"),
		("chuong_admin", "123456", "chuongadmin@gmail.com", "Tây Ninh", "0966288048","admin", "chuong.jpg"),
		("tung_cus1", "123456", "tungcus@gmail.com", "Tây Ninh", "0966288048","customer", "tung.jpg"),
		("tung_staff1", "123456", "tungstaff@gmail.com", "Tây Ninh", "0966288048","staff", "tung.jpg"),
		("tung_cus2", "123456", "tungcus@gmail.com", "Tây Ninh", "0966288048","customer", "tung.jpg"),
		("tung_staff2", "123456", "tungstaff@gmail.com", "Tây Ninh", "0966288048","staff", "tung.jpg"),
		("tung_cus3", "123456", "tungcus@gmail.com", "Tây Ninh", "0966288048","customer", "tung.jpg"),
		("tung_staff3", "123456", "tungstaff@gmail.com", "Tây Ninh", "0966288048","staff", "tung.jpg"),
		("hoang_cus1", "123456", "hoangcus@gmail.com", "Tây Ninh", "0966288048","customer", "hoang.jpg"),
		("hoang_staff1", "123456", "hoangstaff@gmail.com", "Tây Ninh", "0966288048","staff", "hoang.jpg"),
		("hoang_cus2", "123456", "hoangcus@gmail.com", "Tây Ninh", "0966288048","customer", "hoang.jpg"),
		("hoang_staff2", "123456", "hoangstaff@gmail.com", "Tây Ninh", "0966288048","staff", "hoang.jpg"),
		("hoang_cus3", "123456", "hoangcus@gmail.com", "Tây Ninh", "0966288048","customer", "hoang.jpg"),
		("hoang_staff3", "123456", "hoangstaff@gmail.com", "Tây Ninh", "0966288048","staff", "hoang.jpg");
	
INSERT INTO BRANCH(address, managerId, workingTime, image) 
VALUES ("KTX B ĐHQG", 3, "8AM - 10PM", 'ktxb.jpg'),
		("KTX A DHQG", 7, "8AM - 10PM", 'ktxa.jpg'),
		("Thủ Thiêm", 11, "8AM - 10PM", 'hamthuthiem.jpg'),
		("HCMUTE", 15, "8AM - 10PM", 'ute.jpg'),
		("Land mark 81", 19, "8AM - 10PM", 'landmark81.jpg');

INSERT INTO WORK_ON(staffId, branchId) VALUES (2, 1), (3, 1),(22,1), (24,1), (26,1), (14,1), (10,1), (6,2), (7,2), (18,2), (28,2), (30,2), (32,2);

INSERT INTO reservations(userId, branchId, quantity, reservationDate)
VALUES (1,1,5, CAST('2023-12-20 12:12:12' AS datetime)),
		(1,2,2, CAST('2023-12-20 12:12:12' AS datetime)),
        (2,1,5, CAST('2023-12-20 12:12:12' AS datetime)),
        (2,2,5, CAST('2023-12-20 12:12:12' AS datetime));

INSERT INTO MEETINGS(meetingName, meetingDate, description, hostId, branchId)
VALUES ("Giới thiệu sách mới", CAST('2023-12-20 12:12:12' AS datetime), "Giới thiệu sách mới", 1, 1),
		("Nuoi duong tam hon", CAST('2023-12-20 12:12:12' AS datetime), "Nuoi duong tam hon", 5, 1),
        ("Vi ban xung dang", CAST('2023-12-20 12:12:12' AS datetime), "Vi ban xung dang", 9, 1),
        ("Never give up!", CAST('2023-12-20 12:12:12' AS datetime), "Never give up!", 13, 1);
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