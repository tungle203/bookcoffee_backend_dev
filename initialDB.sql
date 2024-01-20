drop database bookcoffee_PK;
drop database bookcoffee; 

create database bookcoffee;
CREATE database bookcoffee_PK;

use bookcoffee;

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
    avatar VARCHAR(255) DEFAULT 'default-avatar.jpg',
    role enum('customer','staff', 'manager', 'admin') DEFAULT 'customer',
    disable BOOL DEFAULT false,
    refreshToken TEXT,
    publicKey TEXT,
    createdDate TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE bookcoffee_PK.PRIVATE_KEY (
	keyId INT AUTO_INCREMENT PRIMARY KEY,
	userId INT,
	privateKey TEXT,
	FOREIGN KEY (userId) REFERENCES bookcoffee.USER(userId)
);


DELIMITER //
CREATE TRIGGER update_privateKey AFTER INSERT ON USER
FOR EACH ROW
BEGIN
    INSERT INTO bookcoffee_PK.PRIVATE_KEY(userId) VALUES (new.userId);
END;
//
DELIMITER ;




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
    genre VARCHAR(255) DEFAULT 'Lãng mạn',
    publicationYear VARCHAR(4),
    salePrice INT,
    authorId INT,
    image VARCHAR(255),
    description TEXT,
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
    confirmDate TIMESTAMP,
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
    branchId INT,
    confirmStaff INT,
    deposit INT,
    isReturn BOOL DEFAULT false,
    borrowDate TIMESTAMP DEFAULT current_timestamp,
    returnDate TIMESTAMP,
    createdDate TIMESTAMP DEFAULT current_timestamp,
    FOREIGN KEY (userId) REFERENCES USER(userId),
    FOREIGN KEY (staffId) REFERENCES USER(userId),
    FOREIGN KEY (confirmStaff) REFERENCES USER(userId),
    FOREIGN KEY (branchId) REFERENCES BRANCH(branchId),
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
    FOREIGN KEY (staffId) REFERENCES USER(userId),
    FOREIGN KEY (copyId) REFERENCES BOOK_COPY(copyId),
    FOREIGN KEY (confirmStaff) REFERENCES USER(userId),
    FOREIGN KEY (branchId) REFERENCES BRANCH(branchId)
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

INSERT INTO AUTHOR(authorName) VALUES  ("John Green"),("Luis Sepúlveda"),("Harper Lee"),("Ayn Rand"),("Hector Malot"),("Agatha Christie"),("Stephen King"),("Nguyễn Nhật Ánh"),("Diana Lea, Jennifer Bradbery"),("Paulo Coelho"), ("Miyabe Miyuki"),("Thomas Harris");
									
INSERT INTO BOOK(title, genre, authorId, salePrice, image, publicationYear, description)
VALUES ("Khi Lỗi Thuộc Về Những Vì Sao (Tái Bản)", "Lãng mạn", 1, 159000, 'the-fault-in-our-stars.webp', "2014", "Mặc dù phép màu y học đã giúp thu hẹp khối u và ban thêm vài năm sống cho Hazel nhưng cuộc đời cô bé đang ở vào giai đoạn cuối, từng chương kế tiếp được viết theo kết quả chẩn đoán. Nhưng khi có một nhân vật điển trai tên là Augustus Waters đột nhiên xuất hiện tại Hội Tương Trợ Bệnh Nhi Ung Thư, câu chuyện của Hazel sắp được viết lại hoàn toàn.

Sâu sắc, táo bạo, ngang tàng, và thô ráp, Khi lỗi thuộc về những vì sao là tác phẩm thương tâm và tham vọng nhất của John Green, tác giả của những giải thưởng, nhưng đồng thời lại khám phá một cách khéo léo nét hài hước, li kỳ, và bi thảm của việc sống và việc yêu."),
("Những Thành Phố Giấy ( Tái Bản )", "Trinh thám", 1, 115000, 'paper-towns.webp', "2009", "Quentin Jacobsen thầm phải lòng cô bạn Margo Roth Spiegelman xinh đẹp thích phiêu lưu. Thế nên khi Margo cậy cửa sổ lách vào đời cậu – ăn vận như ninja và triệu tập cậu vào một chiến dịch trả thù đầy táo bạo – cậu lập tức đi theo. Qua một đêm rong ruổi, ngày mới đến, Q tới trường và phát hiện ra rằng Margo, vốn luôn là một ẩn số quyến rũ, đã thực sự biến mất đầy bí ẩn. Nhưng Q cũng sớm biết được rằng có những manh mối – và những manh mối ấy được để lại cho cậu. Gấp gáp lần theo cung đường đứt khúc, càng đến gần, Q càng khó nhận ra được cô gái mà cậu tưởng chừng đã quá quen thuộc…"),
("Chuyện Con Mèo Dạy Hải Âu Bay (Tái Bản 2019)", "Thiếu nhi", 2, 39000, 'the-story-of-a-seagull-and-the-cat-who-taught-her-to-fly.webp', "2019", "Cô hải âu Kengah bị nhấn chìm trong váng dầu – thứ chất thải nguy hiểm mà những con người xấu xa bí mật đổ ra đại dương. Với nỗ lực đầy tuyệt vọng, cô bay vào bến cảng Hamburg và rơi xuống ban công của con mèo mun, to đùng, mập ú Zorba. Trong phút cuối cuộc đời, cô sinh ra một quả trứng và con mèo mun hứa với cô sẽ thực hiện ba lời hứa chừng như không tưởng với loài mèo:

Không ăn quả trứng.

Chăm sóc cho tới khi nó nở.

Dạy cho con hải âu bay.

Lời hứa của một con mèo cũng là trách nhiệm của toàn bộ mèo trên bến cảng, bởi vậy bè bạn của Zorba bao gồm ngài mèo Đại Tá đầy uy tín, mèo Secretario nhanh nhảu, mèo Einstein uyên bác, mèo Bốn Biển đầy kinh nghiệm đã chung sức giúp nó hoàn thành trách nhiệm. Tuy nhiên, việc chăm sóc, dạy dỗ một con hải âu đâu phải chuyện đùa, sẽ có hàng trăm rắc rối nảy sinh và cần có những kế hoạch đầy linh hoạt được bàn bạc kỹ càng…

Chuyện con mèo dạy hải âu bay là kiệt tác dành cho thiếu nhi của nhà văn Chi Lê nổi tiếng Luis Sepúlveda – tác giả của cuốn Lão già mê đọc truyện tình đã bán được 18 triệu bản khắp thế giới. Tác phẩm không chỉ là một câu chuyện ấm áp, trong sáng, dễ thương về loài vật mà còn chuyển tải thông điệp về trách nhiệm với môi trường, về sự sẻ chia và yêu thương cũng như ý nghĩa của những nỗ lực – “Chỉ những kẻ dám mới có thể bay”.

Cuốn sách mở đầu cho mùa hè với minh họa dễ thương, hài hước là món quà dành cho mọi trẻ em và người lớn."),
("Chuyện Con Mèo Và Con Chuột Bạn Thân Của Nó - Tái Bản", "Thiếu nhi", 2, 32000, 'chuyen-con-meo-va-con-chuot-ban-than-cua-no.webp', "2019", "“Tôi có thể nói rằng Mix là con mèo của Max nhưng tôi cũng có thể tuyên bố rằng Max là con người của Mix.” Câu chuyện bắt đầu như thế. Gắn bó với nhau từ thủa thiếu thời, cho tới ngày Mix đã già và bị mù thì Max cũng tình nguyện không xê dịch bất cứ thứ gì trong nhà mình nữa.

Thế nhưng đâu chỉ có chuyện người và mèo làm bạn cùng nhau! Max còn kết thân với Mex - một con chuột ba hoa lắm lời, còn cùng nhau dọa cho tên trộm sợ chết khiếp, cùng nhau thực hiện những chuyến phiêu lưu trên mái nhà để Mex ngộ ra rằng không phải cứ có cánh mới bay được!

Dưới ngòi bút tài tình của Luis Sepúlveda, tình bạn tay ba Max-Mix-Mex đã được kể một cách đầy ngọt ngào, lôi cuốn, và “Cuốn sách đẹp đẽ này sẽ khiến lũ trẻ tan chảy và cả người lớn nữa. Đúng là một món khoái khẩu!” (La Croix)"),
("Chuyện Con Chó Tên Là Trung Thành", "Thiếu nhi", 2, 34000, 'chuyen-con-cho-ten-la-trung-thanh.webp', "2021", "Giữa rừng già Nam Mỹ, một chú chó được xua đi săn đuổi một thổ dân da đỏ. Trên đường lần theo dấu kẻ trốn chạy, chú chó dần nhận ra mùi của những thứ mình đã đánh mất: mùi củi khô, mùi bột mì, mùi mật ong,… và rồi mùi người anh em của mình. Chú chó nhớ lại tất cả những gì những Con người của Đất từng dạy cho nó: cách tôn trọng thiên nhiên, biết ơn mẹ đất, sống hòa hợp với vạn vật và đặc biệt cái tên của nó, Afmau - theo tiếng thổ dân nghĩa là Trung thành.

Với tài năng kể chuyện vô song, Luis Sepúlveda biết cách tôn vinh những tình cảm cổ xưa, cao quý một cách sống động, để lại những ấn tượng khó quên về thế giới của người Mapuche, về mối gắn kết của họ với thiên nhiên vĩ đại."),
("Chuyện Con Ốc Sên Muốn Biết Tại Sao Nó Chậm Chạp (Tái Bản 2022)", "Thiếu nhi", 2, 43000, 'chuyen-con-oc-sen-muon-biet-tai-sao-no-cham-chap.webp', "2022", "Nổi loạn hay Bản lĩnh? Chấp nhận sống đời tù túng rồi tự diệt vong, hay dũng cảm đối mặt với thách thức để tìm ra chân trời mới? Đó là những câu hỏi luôn thôi thúc trong lòng khiến chú ốc sên nhỏ \"lạc loài\" quyết tâm từ biệt gia trang ô rô để dấn thân vào cuộc hành trình dài đầy thử thách. Và cuối cùng, người anh hùng của đồng cỏ đã hiểu ra vì sao giống loài của mình lại chậm chạp đến vậy.

Trong thế giới thiên nhiên tươi sáng, sống động đang diễn ra ngay trước mắt bạn đọc, ngòi bút tài tình của Luis Sepulveda dường như biến mỗi người chúng ta thành một chú ốc sên nhỏ, hồn nhiên và nhiệt thành, sống hết mình trên hành trình khôn lớn mỗi ngày."),
("Giết Con Chim Nhại (Tái Bản)", "Trinh thám", 3, 112000, 'giet-con-chim-nhai.webp', "2018", "Nào, hãy mở cuốn sách này ra. Bạn phải làm quen ngay với bố Atticus của hai anh em - Jem và Scout, ông bố luật sư có một cách riêng, để những đứa trẻ của mình cứng cáp và vững vàng hơn khi đón nhận những bức xúc không sao hiểu nổi trong cuộc sống. Bạn sẽ nhớ rất lâu người đàn ông thích trốn trong nhà Boo Radley, kẻ bị đám đông coi là lập dị đã chọn một cách rất riêng để gửi những món quà nhỏ cho Jem và Scout, và khi chúng lâm nguy, đã đột nhiên xuất hiện để che chở. Và tất nhiên, bạn không thể bỏ qua anh chàng Tom Robinson, kẻ bị kết án tử hình vì tội hãm hiếp một cô gái da trắng, sự thật thà và suy nghĩ quá đỗi đơn giản của anh lại dẫn đến một cái kết hết sức đau lòng, chỉ vì lý do anh là một người da đen.

Cho dù được kể dưới góc nhìn của một cô bé, cuốn sách Giết con chim nhại không né tránh bất kỳ vấn đề nào, gai góc hay lớn lao, sâu xa hay phức tạp: nạn phân biệt chủng tộc, những định kiến khắt khe, sự trọng nam khinh nữ… Góc nhìn trẻ thơ là một dấu ấn đậm nét và cũng là đặc sắc trong Giết con chim nhại. Trong sáng, hồn nhiên và đầy cảm xúc, những câu chuyện tưởng như chẳng có gì to tát gieo vào người đọc hạt mầm yêu thương.

Gần 50 năm từ ngày đầu ra mắt, Giết con chim nhại, tác phẩm đầu tay và cũng là cuối cùng của nữ nhà văn Mỹ Harper Lee vẫn đầy sức hút với độc giả ở nhiều lứa tuổi.

Thông điệp yêu thương trải khắp các chương sách là một trong những lý do khiến Giết con chim nhại giữ sức sống lâu bền của mình trong trái tim độc giả ở nhiều quốc gia, nhiều thế hệ. Những độc giả nhí tìm cho mình các trò nghịch ngợm và cách nhìn dí dỏm về thế giới xung quanh. Người lớn lại tìm ra điều thú vị sâu xa trong tình cha con nhà Atticus, và đặc biệt là tình người trong cuộc sống, như bé Scout quả quyết nói “em nghĩ chỉ có một hạng người. Đó là người."),
("Suối Nguồn", "Tâm lý", 4, 450000, 'suoi-nguon.webp', "2023", "Suối nguồn (The Fountainhead) tiểu thuyết của Ayn Rand, tác giả có ảnh hưởng lớn nhất đến độc giả Mỹ trong thế kỷ 20. - Tác phẩm đã bán được 6 triệu bản trong hơn 60 năm qua kể từ khi xuất bản lần đầu (năm 1943). - Được dịch ra nhiều thứ tiếng và vẫn liên tục được tái bản hàng năm. - Một tiểu thuyết kinh điển cần đọc nay đã có mặt tại Việt Nam với bản dịch tiếng Việt. Xin trân trọng giới thiệu cùng quý độc giả."),
("Không Gia Đình", "Tiểu thuyết", 5, 160000, 'khong-gia-dinh.webp', "2021", "Không Gia Đình là tiểu thuyết nổi tiếng nhất trong sự nghiệp văn chương của Hector Malot. Hơn một trăm năm nay, tác phẩm giành giải thưởng của Viện Hàn Lâm Văn học Pháp này đã trở thành người bạn thân thiết của thiếu nhi và tất cả những người yêu mến trẻ khắp thế giới.

Không Gia Đình kể về chuyện đời Rémi, một cậu bé không cha mẹ, họ hàng thân thích. Sau khi phải rời khỏi vòng tay của người má nuôi, em đã đi theo đoàn xiếc thú của cụ già Vitalis tốt bụng. Kể từ đó, em lưu lạc khắp nơi, ban đầu dưới sự che chở của cụ Vitalis, sau đó thì tự lập và còn lo cả công việc biểu diễn và sinh sống cho cả một gánh hát rong. Đã có lúc em và cả đoàn lang thang cả mấy ngày đói khát rồi còn suýt chết rét. Có bận em bị lụt ngầm chôn trong giếng mỏ hàng tuần. Rồi có lần em còn mắc oan bị giải ra tòa và phải ở tù. Nhưng cũng có khi em được nuôi nấng đàng hoàng, no ấm. Song dù trong hoàn cảnh nào, Rémi vẫn giữ được sự gan dạ, ngay thẳng, lòng tự trọng, tính thương người, ham lao động chứ không hạ mình hay gian dối. Cuối cùng, sau bao gian nan khổ cực, em đã đoàn tụ được với gia đình của mình.

Tác phẩm đã ca ngợi sự lao động bền bỉ, tinh thần tự lập, chịu đựng gian khó, khích lệ tình bạn chân chính. Ca ngợi lòng nhân ái, tình yêu cuộc sống, ý chí vươn lên không ngừng…Không Gia Đình vì thế đã vượt qua biên giới nước Pháp và tồn tại lâu dài với thời gian."),
("Thung Lũng Bất Hạnh", "Trinh thám", 6, 120000, 'thung-lung-bat-hanh.webp', "2021", "Khi có mặt tại trang viên Thung Lũng để ăn trưa theo lời mời của bà Lucy Angkatell, thám tử Hercule Poirot không mấy vui khi thấy những vị khách đã dàn dựng một hiện trường án mạng bên hồ bơi để trêu chọc mình.

Thật không may, đó là thật. Lúc những giọt máu loang xuống nước, nạn nhân cũng thì thầm từ cuối “Henrietta”. Khẩu súng trên tay người vợ, vật chứng số một, trong lúc bối rối cũng bị rơi xuống nước.

Điều tra của Poirot cho thấy mọi chuyện phức tạp hơn ông tưởng. Có vẻ như ai cũng có động cơ gây án, và trong đại gia đình nhiều bí ẩn này, mỗi người đều là nạn nhân của tình yêu.

“Một cuốn sách lạ lùng và sâu sắc; như một đại dương sâu thẳm với những dòng chảy ngầm mạnh mẽ.” – Tác giả đoạt giải thưởng quốc tế Michel Houellebecq

“Một cốt truyện hạng A – hay nhất của Christie trong nhiều năm.” - San Francisco Chronicle"),
("Đón Ngọn Triều Dâng", "Trinh thám", 6, 126000, 'don-ngon-trieu-dang.webp', "2022", "Tựa sách lấy từ ý của nhà văn Anh William Shakespeare, trong tác phẩm Julius Caesar. Đây là lời của Brutus khuyên Cassius phải chớp thời cơ phát động cuộc chiến với Octavius và Antony. Ý nghĩa là: đời người có những lúc như ngọn triều dâng. Nếu bắt được ngọn trào để lướt tới thì sẽ thành công, bằng không, cuộc đời về sau sẽ là chuỗi ngày hối tiếc.

Truyện mở đầu với sự kiện ông Gordon Cloade mất trong một trận không kích của quân Đức vào London. Trước đó vài tuần ông vừa kết hôn với bà quả phụ trẻ đẹp Underhay. Sống sót trong tòa nhà đổ nát sau trận bom, bà Underhay trở thành người thừa kế duy nhất gia sản đồ sộ của ông Cloade. Trong khi đó, những người em của ông Cloade, là bác sĩ, luật sư… vốn được ông anh giàu có, hào phóng bảo bọc, sẽ trở nên khó khăn khi đột ngột mất nguồn viện trợ dồi dào.

Ít lâu sau đó, Hercule Poirot có một vị khách bất ngờ, là em dâu của người đàn ông đã chết. Bà cho biết đã được các “linh hồn” cảnh báo rằng người chồng đầu tiên của bà Underhay vẫn còn sống, và đề nghị Poirot tìm ông ta. Tìm kiếm một người mất tích dưới sự hướng dẫn của thế giới siêu nhiên quả thật lạ lùng. Tuy nhiên, bí ẩn lớn nhất với Poirot là, động cơ thực sự của người phụ nữ này là gì? Rồi một án mạng xảy ra, và Poirot bắt đầu xâu chuỗi các sự kiện… Việc tìm ra hung thủ thật không dễ dàng, vì trong số những người bị tình nghi, ai cũng có thể là kẻ dám đón đầu ngọn sóng để xoay chuyển tình thế."),
("Hiểm Họa Ở Nhà Kết", "Trinh thám", 6, 92000, 'hiem-hoa-o-nha-ket.webp', "2022", "Poirot và người bạn trung thành Hastings tình cờ phát hiện những âm mưu đang diễn ra tại một dinh thự cổ ở nông thôn. Tất cả đều nhắm tới việc đoạt mạng chủ nhân Nhà Kết - một cô gái trẻ xinh đẹp, tràn đầy sức sống.

Đầu tiên, trên một sườn đồi nguy hiểm, chiếc xe của cô bị hỏng hóc. Rồi một tảng đá lớn lăn xuống suýt đè trúng cô trên con đường ven biển. Sau đó, bức tranh sơn dầu to nặng treo ở đầu giường rơi xuống và nữ chủ nhân Nhà Kết chỉ thoát chết nhờ một khoảnh khắc tình cờ may mắn. Khi tìm thấy một lỗ đạn trên chiếc mũ của cô, Poirot quyết định đặt cô gái trẻ Burkley dưới sự bảo vệ của ông, và cố gắng làm sáng tỏ bí ẩn xung quanh một vụ án mạng….

Nhịp độ tuyệt hảo, những gợi ý được cài cắm tinh tế, và câu trả lời vô cùng bất ngờ nhưng tuyệt đối logic - Hiểm họa ở Nhà Kết là một câu chuyện hoàn hảo, xứng đáng có vị trí trong top 10 tác phẩm hay nhất của Agatha Christie, như nhà \"Christie học\" John Curran đã điểm qua.


\"Agatha Christie là đại diện vĩ đại nhất của truyện trinh thám. Tài năng văn học độc đáo của bà đã xuyên qua mọi ranh giới tuổi tác, màu da, giai cấp, địa lý và giáo dục. Khi bà trau chuốt thể loại truyện giả tưởng này và làm nó trở nên óng ả, đọc những cuốn sách của bà đã trở thành thú vui toàn cầu.\"

- John Curran -"),
("Và Rồi Chẳng Còn Ai", "Trinh thám", 6, 96000, 'va-roi-chang-con-ai.webp', "2021", "“Mười…” Mười người bị lừa ra một hòn đảo nằm trơ trọi giữa biển khơi thuộc vịnh Devon, tất cả được bố trí cho ở trong một căn nhà. Tác giả của trò bịp này là một nhân vật bí hiểm có tên “U.N.Owen”.

“Chín…” Trong bữa ăn tối, một thông điệp được thu âm sẵn vang lên lần lượt buộc tội từng người đã gây ra những tội ác bí mật. Vào cuối buổi tối hôm đó, một vị khách đã thiệt mạng.

“Tám…” Bị kẹt lại giữa muôn trùng khơi vì giông bão cùng nỗi ám ảnh về một bài vè đếm ngược, từng người, từng người một… những vị khách trên đảo bắt đầu bỏ mạng.

“Bảy…” Ai trong số mười người trên đảo là kẻ giết người, và liệu ai trong số họ có thể sống sót?

“Một trong những tác phẩm gây tò mò hay nhất, xuất sắc nhất của Christie.” – Tạp chí Observer

“Kiệt tác của Agatha Christie.” – Tạp chí Spectator"),
("Học Viện", "Trinh thám", 7, 226000, 'hoc-vien.webp', "2021", "Bên cạnh Bản đặc biệt The Institute ( Học Viện) làm nức lòng người hâm mộ ông hoàng truyện kinh dị Stephen King, 1980Books tiếp tục ra mắt bản thường của Học Viện để đưa tác phẩm đến gần với đông đảo người hâm mộ truyện hơn.

Học Viện là tác phẩm áp út của tác giả bán được hơn 350 triệu cuốn sách trên toàn thế giới, Stephen King.

Tác phẩm mở ra với nhân vật Tim Jamieson, một cựu cảnh sát người Mỹ bị mất việc đang lang thang trên cuộc hành trình dọc về phía bắc. Tình cờ, anh tới một thị trấn không-ai-biết-tới: DuPray. Tại đây anh được nhận vào làm người gác đêm của thị trấn, mong rằng quãng thời gian sắp tới sẽ êm đề

Thế nhưng đó chỉ là vòng ngoài, phần lớn câu chuyện diễn ra trong một cơ sở bí mật của chính phủ, với khung cảnh xám xịt, đen tối và đầy căng thẳng, xoay quanh một cậu bé 12 tuổi Luke Ellis.

Luke Ellis là một thần đồng với dự định theo học tại hai trường đại học cùng một lúc. Nhưng rồi cuộc sống của cậu đã thay đổi hoàn toàn khi phát hiện ra mình tỉnh dậy trong một căn phòng giống hệt phòng ngủ tại nhà, nhưng nơi này lại là một cơ sở bí mật nằm ở vùng hẻo lánh giữa rừng già Bắc Maine với cái tên gọi: Học Viện. Ở đây có những đứa trẻ đặc biệt giống như cậu, sinh sống ở Khu nửa trước. Giám đốc của Học viện, bà Sigsby, và các nhân viên của bà ta hằng ngày tàn nhẫn khai thác sức mạnh từ những đứa trẻ này, nghiên cứu và sử dụng những món quà đặc biệt của chúng.

Nếu bạn vâng lời, bạn sẽ nhận được mã để mua bất kì thứ gì từ các máy bán hàng tự động. Nếu bạn không nghe theo, điều chờ đón bạn là những hình phạt tàn bạo. Mỗi khi có một đứa trẻ bị đưa tới Khu nửa sau và không bao giờ trở lại, Luke càng trở nên tuyệt vọng với việc trốn thoát ra ngoài và tìm sự giúp đỡ. Chưa từng có ai trốn thoát khỏi Học Viện.

Sự thật đằng sau nơi được gọi là Học Viện này là gì? Và cái kết nào cho những đứa trẻ bị bắt tới Học Viện?
Về tác giả:
Độc giả không còn xa lạ với cái tên Stephen King, tác giả dòng sách kinh dị, kì bí nổi danh toàn thế giới với các tác phẩm cùng các bộ phim chuyển thể đã trở thành kinh điển.
Ông là tác giả của hơn 50 cuốn sách bán chạy nhất - là một bậc thầy trong việc tạo ra một bầu không khí u ám bao phủ lên từng trang truyện.

Stephen King là người giỏi nhất trong việc tạo ra từng mảnh ghép của câu chuyện và xếp đặt chúng lại với nhau theo một cách khéo léo, dễ hiểu và đơn giản. Học Viện không quá bạo lực hoặc rùng rợn như xu hướng trong một số cuốn sách khác của King. Nửa đầu cuốn sách có diễn tiến chậm rãi, vẽ nên một khung cảnh tưởng chừng êm đềm và nhẹ nhàng, nhưng King đã cài cắm những gợi mở nội dung và những tình tiết nhỏ vào từng câu chữ, để mỗi phần đều là một mắt xích giúp khai phá ra sự thật ẩn đằng sau Học Viện.

Mọi thứ bạn mong đợi ở Stephen King đều có trong cuốn sách này: những nhân vật với tính cách được khắc họa vô cùng lập dị; một cốt truyện được xây dựng chặt chẽ và mỗi chi tiết nhỏ đều được sắp đặt có chủ đích; một cảm giác người đọc được tự thỏa sức tưởng tượng ra từng khung cảnh; và những câu chuyện cảm động về tình bạn khiến ta thấy bứt rứt.

The Institute cho thấy Stephen King dù tuổi đã cao nhưng vẫn đang còn ở đỉnh cao phong độ.
Một số nhận định về cuốn sách:

_“King lại gây ấn tượng với một câu chuyện đau lòng về những đứa trẻ chiến thắng cái ác kể từ sau IT – Chú hề ma quái… Một lần nữa chứng minh tại sao Stephen King là vua của thể loại truyện kinh dị.” - Publishers Weekly, STARRED review.
_“Cuốn sách ngay lập tức nhắc nhở tôi về những lý do khiến tôi yêu mến S.King. Ông ấy tiếp cận gần với thực tế cuộc sống của tầng lớp lao động Mỹ hơn bất kỳ nhà văn nào còn sống mà tôi có thể nghĩ tới”. _ Dwight Garner, The New York Times.
_“Học Viện được mài giũa một cách hoàn hảo và say mê tựa như những tác phẩm xuất sắc khác của King…Làm cách nào để bạn có thể duy trì phẩm giá và nhân cách của mình trong một môi trường được tạo ra để tước bỏ đi cả hai điều đó? Đây là một chủ đề cấp bách trong văn học từ thế kỷ 20 nhưng lại là chủ đề thường trực trong những tác phẩm của S.King. Trong vũ trụ các anh hùng chiến đấu của Mr.King, sự chậm chạp đến vô đạo có thể trở thành điều đáng sợ nhất! _ Laura Miller, The New York Times Book Review.
_ “Học Viện lại là một chiến thắng nữa của S.King: rùng rợn, cảm động và đáng tin đến king hoàng, tất cả hội tụ trong một tác phẩm.” – The Boston Globe
_ “Bạn không cần phải là một người hâm mộ tiểu thuyết kinh dị để đọc Học Viện. Cách kể chuyện của Stephen King vượt qua ranh giới của thể loại.” – Marion Winnick, Newsday"),
("Nhà Tù Shawshank", "Kinh dị", 7, 273000, 'nha-tu-shawshank.webp', "2023", "Cuốn sách được chia thành 4 phần: Hy vọng tựa nhựa Xuân, Mùa Hè vụn vỡ, Thu tàn thơ ngây, và Câu chuyện mùa Đông, mỗi phần là một câu chuyện. Trong đó:

Nhà tù Shawshank là phần nổi bật nhất, tương ứng với phần Hy vọng tựa nhựa Xuân. Bộ phim cùng tên (Shawshank Redemption) cũng đã được đề cử cho giải Oscar năm 1994 cho hạng mục Phim chuyển thể hay nhất.

Truyện nói về Andy Dufresne một chủ ngân hàng bị kết án oan giết vợ phải ngồi tù chung thân tại nhà tù khét tiếng nhất bang là Shawshank. Khác hẳn với những con người đầu hàng số phận và sống buông xuôi tại những buồng giam, song sắt – Andy vẫn nuôi dưỡng kế hoạch vượt ngục trong mình. Trong suốt quá trình ở Shawshank, Andy chứng kiến sự tàn ác của cai ngục, của sự mất nhân tính và sự tha hóa của giám đốc nhà tù khi nhúng tay vào tham nhũng, bóc lột và giết chóc tù nhân. Tuy nhiên giữa những mặt tối ấy, tình bạn cao đẹp cũng như niềm tin vào số phận của Andy dành cho những con người anh yêu mến như Red, Tommy bật lên như ngọn lửa le lói trong giông bão nhưng vô cùng mạnh mẽ đưa con người vực dậy từ cõi chết. Có thể đây là một tác phẩm ít máu me và cảm động nhất của Stephen King.

Ba truyện còn lại bao gồm:

“Apt Pupil” (Học sinh ngoan) – tương ứng với phần Mùa hè vụn vỡ - là nguồn cảm hứng cho bộ phim cùng tên kể về cậu học sinh trung học hàng đầu Todd Bowden và nỗi ám ảnh về quá khứ đen tối và chết chóc của một người đàn ông lớn tuổi trong thị trấn. Đây không phải là một câu chuyện kinh dị, mà là một thước phim tâm lý kinh dị. Cậu bé 14 tuổi Todd Bowden ấy vô tình bị rơi vào vòng xoáy tò mò đến mê hoặc về các trại tử thần Diệt chủng người Do Thái. Sau khi tìm hiểu và phát hiện ra người hàng xóm là một tên phát xít SS đang ẩn náu, cậu ta đã tống tiền người đàn ông này để đổi lại được nghe chi tiết về những gì thực sự đã xảy ra tại các trại diệt chủng. Cả hai đã hình thành mối quan hệ yêu/ghét kéo dài đến hết cuộc đời của họ cho đến khi thứ đã gắn kết họ lại với nhau lại kéo họ ra xa nhau bằng sự báo thù.

Trong “The Body” (Cái xác) – tương ứng với phần Thu tàn thơ ngây – viết về bốn chàng trai trẻ ngổ ngáo tại một thị trấn nhỏ và hành trình đối mặt với sự sống, cái chết và những nguy cơ về cái chết của chính họ. Câu chuyện này đã được chuyển thể thành bộ phim Stand By Me.

Cuối cùng là câu chuyện về một người phụ nữ xấu số đã qua đời trong một tai nạn kinh hoàng vào đúng ngày cô chuyển dạ trong “Phương pháp Hít thở” thuộc phần Câu chuyện mùa đông. Lấy bối cảnh một Giáng sinh lạnh giá, bão tố, King sẽ cho độc giả được trải nghiệm những yếu tố kinh dị điển hình trong ngòi bút của ông qua câu chuyện này.”

Về tác giả
Stephen King

Nói đến thể loại văn học kinh dị, có lẽ không ai là không biết đến Stephen King, ông vua của thể loại này. Với hơn 350 triệu đầu sách được bán ra trên toàn thế giới với vô vàn giải thưởng lớn như National Medal of Art, British Fantasy Society Award… Stephen King đã trở thành ông hoàng sách kinh dị cũng như của các tác phẩm chuyển thể.

Trong suốt 50 năm cống hiến cho nền văn học thế giới, Stephen King đã nhận được 3 giải thành tựu trọn đời cũng như được Tổng thống Barack Obama trao tặng Huân chương quốc gia vì nghệ thuật vào năm 2015.

Những tác phẩm của King không chỉ đem lại nỗi sợ hãi cá nhân cho người đọc mà còn xây dựng nên cả một nền văn hóa kinh dị cho thế giới. Ông là tác giả duy nhất có hơn 30 cuốn sách từng đứng đầu trong danh sách bán chạy nhất thế giới và cũng là người định nghĩa lại 3 cảm xúc chính trong mảng kinh dị là Kinh hoàng (Terror), Ghê rợn (Horror) và Khiếp sợ (Revulsion).

Quan điểm người sáng tác có thể điều khiển tâm trí độc giả để tạo ra những cảm xúc sợ hãi khiến các tác phẩm của ông luôn thu hút được người đọc. Thậm chí số lượng tác phẩm điện ảnh chuyển thể từ tiểu thuyết của Stephen còn nhiều hơn số tiểu thuyết mà ông viết.

Một số đánh giá về cuốn sách

1. “Một tác phẩm chứa dựng bộ tứ câu chuyện kinh dị ấn tượng - nguồn cảm hứng đứng sau những bộ phim chuyển thể thành công nhất của King như Stand by me và Nhà tù Shawshank. Với cái tài miêu tả và dẫn dắt của King, ta sẽ chỉ thấy mê hoặc, hồi hộp đến nín thở, như cái cách bạn đang được dìu bước xuyên qua một bãi mìn.” - Portland Oregonian

2. “Sách của King luôn khiến độc giả không thể cưỡng lại việc liên tục lật giở những trang sách, dự đoá để rồi vỡ òa trước một cái kết không thể thông minh hơn.” - Los Angeles Herald Examiner

3. “Không có con quỷ nào rúc rích trong tủ quần áo, không có ma cà rồng nào đùa giỡn dưới ánh trăng. Nhưng những móng vuốt xù xì trong các tác phẩm của King luôn khiến ta phải rợn tóc gáy.” - Cosmopotian"),
("Cây Chuối Non Đi Giày Xanh", "Tiểu thuyết", 8, 74000, 'cay-chuoi-non-di-giay-xanh.webp', "2021", "Kỷ niệm bao giờ cũng đẹp và đặc biệt là không biết phản bội. Câu chuyện này kể về kỷ niệm. Có nỗi sợ trẻ con ai cũng từng qua, có rung động mơ hồ đủ khiến hồi hộp đỏ mặt. Mối ghen tuông len lỏi, nỗi buồn thắt tim, và những giấc mơ trong veo êm đềm mang đến niềm vui, niềm hy vọng…

Truyện dài mới nhất của nhà văn Nguyễn Nhật Ánh lần này chỉ có một bài hát lãng mạn có lẽ ai cũng mê, còn lại là những con chữ mang đến hạnh phúc. Để dành tặng cho các bạn trẻ, và những ai từng qua tuổi ấu thơ."),
("Thằng Quỷ Nhỏ (Tái Bản 2022)", "Tiểu thuyết", 8, 45000, 'thang-quy-nho.webp', "2022", "Truyện dài đặc sắc nhất của Nguyễn Nhật Ánh. Tập truyện được sinh viên học sinh rất đỗi say mê. Bởi sự dí dỏm, bởi tình người, bởi những hình ảnh rất học sinh, rất áo trắng. Hãy làm quen với Thằng quỷ nhỏ vẩy tai lừa có cái tên con gái là Quỳnh… cùng những người bạn dễ thương khác như Hạnh, Nga…."),
("Tôi Thấy Hoa Vàng Trên Cỏ Xanh", "Tiểu thuyết", 8, 120000, 'toi-thay-hoa-vang-tren-co-xanh.webp', "2018", "Ta bắt gặp trong Tôi Thấy Hoa Vàng Trên Cỏ Xanh một thế giới đấy bất ngờ và thi vị non trẻ với những suy ngẫm giản dị thôi nhưng gần gũi đến lạ. Câu chuyện của Tôi Thấy Hoa Vàng Trên Cỏ Xanh có chút này chút kia, để ai soi vào cũng thấy mình trong đó, kiểu như lá thư tình đầu đời của cu Thiều chẳng hạ ngây ngô và khờ khạo.

Nhưng Tôi Thấy Hoa Vàng Trên Cỏ Xanh hình như không còn trong trẻo, thuần khiết trọn vẹn của một thế giới tuổi thơ nữa. Cuốn sách nhỏ nhắn vẫn hồn hậu, dí dỏm, ngọt ngào nhưng lại phảng phất nỗi buồn, về một người cha bệnh tật trốn nhà vì không muốn làm khổ vợ con, về một người cha khác giả làm vua bởi đứa con tâm thầm của ông luôn nghĩ mình là công chúa, Những bài học về luân lý, về tình người trở đi trở lại trong day dứt và tiếc nuối.

Tôi Thấy Hoa Vàng Trên Cỏ Xanh lắng đọng nhẹ nhàng trong tâm tưởng để rồi ai đã lỡ đọc rồi mà muốn quên đi thì thật khó.

“Tôi thấy hoa vàng trên cỏ xanh” truyện dài mới nhất của nhà văn vừa nhận giải văn chương ASEAN Nguyễn Nhật Ánh - đã được Nhà xuất bản Trẻ mua tác quyền và giới thiệu đến độc giả cả nước.

Cuốn sách viết về tuổi thơ nghèo khó ở một làng quê, bên cạnh đề tài tình yêu quen thuộc, lần đầu tiên Nguyễn Nhật Ánh đưa vào tác phẩm của mình những nhân vật phản diện và đặt ra vấn đề đạo đức như sự vô tâm, cái ác. 81 chương ngắn là 81 câu chuyện nhỏ của những đứa trẻ xảy ra ở một ngôi làng: chuyện về con cóc Cậu trời, chuyện ma, chuyện công chúa và hoàng tử, bên cạnh chuyện đói ăn, cháy nhà, lụt lội, “Tôi thấy hoa vàng trên cỏ xanh” hứa hẹn đem đến những điều thú vị với cả bạn đọc nhỏ tuổi và người lớn bằng giọng văn trong sáng, hồn nhiên, giản dị của trẻ con cùng nhiều tình tiết thú vị, bất ngờ và cảm động trong suốt hơn 300 trang sách. Cuốn sách, vì thế có sức ám ảnh, thu hút, hấp dẫn không thể bỏ qua."),
("Con Chó Nhỏ Mang Giỏ Hoa Hồng (Tái Bản)", "Tiểu thuyết", 8, 67000, 'con-cho-nho-mang-gio-hoa-hong.webp', "2020", "Cái tựa sách quả là có sức gợi tò mò.

Tại sao lại là con chó mang giỏ hoa hồng? Nó mang cho bạn nó, hay cho những ai biết yêu thương nó?

Câu chuyện về 5 chú chó đầy thú vị và cũng không kém cảm xúc lãng mạn- tác phẩm mới nhất của nhà văn bestseller Nguyễn Nhật Ánh sẽ khiến bạn thay đổi nhiều trong cách nhìn về loài thú cưng số 1 thế giới này."),
("Tôi Là Bêtô", "Tiểu thuyết", 8, 84000, 'toi-la-beto.webp', "2021", "Tôi Là Bêtô là tác phẩm mới nhất của nhà văn chuyên viết cho thanh thiếu niên của Nguyễn Nhật Ánh. Anh đã được đông đảo bạn đọc biết đến qua các tác phẩm quen thuộc như Thằng quỷ nhỏ, Trại hoa vàng, Bong bóng lên trời, Cô gái đến từ hôm qua… và hai bộ truyện nhiều tập Kính vạn hoa và Chuyện xứ Lang Biang. Với Tôi là Bêtô, đây là lần đầu tiên anh viết một tác phẩm qua lời kể của một chú cún. Trong thiên truyện này, thế giới được nhìn một cách trong trẻo nhưng lồng trong đó không thiếu những ý tứ thâm trầm, khiến người đọc phải ngẫm nghĩ. Đây chắc chắn là tác phẩm không chỉ dành cho trẻ em.

“Tôi xa quê từ rất sớm. Có lẽ vì vậy, đối với tôi tuổi thơ là một vùng trời luôn lung linh trong ký ức. Tôi vẫn còn nhớ rõ hình ảnh những trưa hè tuổi thơ, tôi ngồi trong vườn cây nhà dì chơi đùa ra sao với các anh chị con dì, nhớ những ngày trốn học đi tắm sông, mẹ tôi phải lặn lội đi tìm, nhớ những cánh diều trong sân trường tiểu học, nhớ cây trứng cá sai trái ở ngoài cửa sổ lớp tôi… Đến bây giờ, những lúc ngồi ôn lại những kỷ niệm ngày xưa còn bé, tôi luôn cảm thấy bồi hồi. Đó là tâm trạng nuối tiếc của kẻ đã rời xa sân ga tuổi nhỏ và biết mình vĩnh viễn không quay lại được.

Có lẽ chính sự ám ảnh đó đã đi vào các trang sách của tôi và tự nhiên tôi trở thành nhà văn viết cho trẻ em. Mà thực ra cũng có một phần là viết cho chính mình, như một cách giải tỏa. Và đó chính là “thực tế” quan trọng nhất của tôi. Vì tôi nghĩ một nhà văn chỉ viết hay, viết xúc động nhất về những gì làm cho anh ta bức xúc, khao khát - những gì gần gũi, thân thuộc, máu thịt và giàu sức ám ảnh nhất.”

(Nguyễn Nhật Ánh)"),
("Oxford Advanced Learner's Dictionary : Paperback - 10th Edition (With 1 Year's Access To Both Premium Online And App)", "Từ điển", 9, 67000, 'oxford-advanced-learner-s-dictionary.webp', "2020", "Oxford Advanced Learner's Dictionary 10th edition builds English vocabulary better than ever before and leads the way to more confident, successful communication in English.

The Oxford Advanced Learner's Dictionary is the world's bestselling advanced level dictionary for learners of English.

Now in its 10th edition, the Oxford Advanced Learner's Dictionary, or OALD, is your complete guide to learning English vocabulary with definitions that learners can understand, example sentences showing language in use, and the new Oxford 3000™ and Oxford 5000™ word lists providing core vocabulary that every student needs to learn.

OALD is more than a dictionary. Take your English skills to the next level with extra resources and practice including the online iSpeaker and iWriter, or practise words anytime, anywhere with the Oxford Advanced Learner's Dictionary app.

Includes 1 year's access to Oxford Advanced Learner's Dictionary premium online and 1 year's access to the Oxford Advanced Learner's Dictionary 10th edition app.

- Over 60,000 words, 79,000 phrases, 89,000 meanings and 109,000 examples
- 1000+ NEW words and meanings (chatbot, fake news, microplastic, woke)
- NEW Oxford 3000™ and Oxford 5000™ keywords graded by CEFR level
- NEW OPAL™ (Oxford Phrasal Academic Lexicon) teaches academic keywords
- Visual Vocabulary Builder including NEW illustrations for topic vocabulary
- Oxford Speaking Tutor and iSpeaker prepare you for exams and presentations – UPDATED iSpeaker coming soon
- Oxford Writing Tutor and iWriter help you plan, write and review your written work
- Teaching resources including 50 NEW vocabulary worksheets and NEW and revised lesson plans available online"),
("Nhà Giả Kim (Tái Bản 2020)", "Huyền bí", 10, 59000, 'nha-gia-kim.webp', "2020", "Tất cả những trải nghiệm trong chuyến phiêu du theo đuổi vận mệnh của mình đã giúp Santiago thấu hiểu được ý nghĩa sâu xa nhất của hạnh phúc, hòa hợp với vũ trụ và con người.

Tiểu thuyết Nhà giả kim của Paulo Coelho như một câu chuyện cổ tích giản dị, nhân ái, giàu chất thơ, thấm đẫm những minh triết huyền bí của phương Đông. Trong lần xuất bản đầu tiên tại Brazil vào năm 1988, sách chỉ bán được 900 bản. Nhưng, với số phận đặc biệt của cuốn sách dành cho toàn nhân loại, vượt ra ngoài biên giới quốc gia, Nhà giả kim đã làm rung động hàng triệu tâm hồn, trở thành một trong những cuốn sách bán chạy nhất mọi thời đại, và có thể làm thay đổi cuộc đời người đọc.

“Nhưng nhà luyện kim đan không quan tâm mấy đến những điều ấy. Ông đã từng thấy nhiều người đến rồi đi, trong khi ốc đảo và sa mạc vẫn là ốc đảo và sa mạc. Ông đã thấy vua chúa và kẻ ăn xin đi qua biển cát này, cái biển cát thường xuyên thay hình đổi dạng vì gió thổi nhưng vẫn mãi mãi là biển cát mà ông đã biết từ thuở nhỏ. Tuy vậy, tự đáy lòng mình, ông không thể không cảm thấy vui trước hạnh phúc của mỗi người lữ khách, sau bao ngày chỉ có cát vàng với trời xanh nay được thấy chà là xanh tươi hiện ra trước mắt. ‘Có thể Thượng đế tạo ra sa mạc chỉ để cho con người biết quý trọng cây chà là,’ ông nghĩ.”

- Trích Nhà giả kim"),
("Chuyện Kỳ Lạ Ở Tiệm Sách Cũ Tanabe", "Trinh thám", 11, 120000, 'chuyen-ky-la-o-tiem-sach-cu-tanabe.webp', "2023", "Cuốn sách là một tuyển tập những câu truyện “trinh thám” ngắn liên quan đến hành trình phá án hay đi tìm câu trả lời cho những bí ẩn hay “vụ án” xuất phát hoặc liên quan đến tiệm sách Tanabe nơi lão Iwa làm chủ. Trong suốt những hành trình nhỏ ấy, cả lão Iwa và đứa cháu Minoru của mình đã cho độc giả thấy lần lượt từng lớp lang bản chất con người (cả tiêu cực lẫn tích cực) cũng như mối quan hệ và tình cảm gia đình được thể hiện khéo léo qua những tương tác của hai ông cháu.

Tác giả

Tác giả Miyabe Miyuki sinh năm 1960 tại Tokyo, được biết đến như “Tác giả quốc dân của nền văn học Nhật Bản”. Sau khi ra mắt công chúng lần đầu vào năm 1987, bà tiếp tục viết sách và nhận được rất nhiều giải thưởng ở nhiều thể loại khác nhau như tiểu thuyết trinh thám, tiểu thuyết thời đại, tiểu thuyết giả tưởng… Bên cạnh đó, 11 năm liền bà được bầu chọn là “Tác giả nữ được yêu thích nhất” và được xem là “Kỳ tích của lịch sử văn học Nhật Bản”."),
("Hannibal", "Tâm lí", 12, 110000, "hannibal.webp", "2021", "Được xem là một trong những sự kiện văn chương được chờ đợi nhất, Hannibal và những ngày run rẩy bắt đầu mang người đọc vào cung điện ký ức của một kẻ ăn thịt người, tạo dựng nên một bức chân dung ớn lạnh của tội ác đang âm thầm sinh sôi – một thành công của thể loại kinh dị tâm lý.

Với Mason Verger, nạn nhân đã bịHannibal biến thành kẻ người không ra người,Hannibal là mối hận thù nhức nhối da thịt.

Với đặc vụ Clarice Starling của FBI, người từng thẩm vấnHannibal trong trại tâm thần, giọng kim ken két của hắn vẫn vang vọng trong giấc mơ cô.

Với cảnh sát Rinaldo Pazzi đang thất thế, Lecter hứa hẹn mang tới một khoản tiền béo bở để đổi vận.

Và những cuộc săn lùng Hannibal Lecter bắt đầu, kéo theo đó là những chuỗi ngày run rẩy hòng chấm dứt bảy năm tự do của hắn. Nhưng trong ba kẻ đi săn, chỉ một kẻ có bản lĩnh sống trụ lại để hưởng thành quả của mình.

Nhận định

“Độc giả đang mong ngóng Hannibal và những ngày run rẩy bắt đầu vì tò mò không biết nó có tuyệt như Red Dragon (Rồng đỏ) và The Silence of the Lambs (Sự im lặng của bầy cừu) không… Thật may mắn khi có thể trả lời bằng một câu phủ định. Không. Không tuyệt như thế. Mà tuyệt hơn.”

- Stephen King, New York Times Book Review

“Phải chăng cuốn tiểu thuyết xuất sắc nhất năm nay là cuốn này? một kiệt tác… hấp dẫn đến lạnh người… Hannibal và những ngày run rẩy bắt đầu cuốn hút từ phần mở đầu chân thực tuyệt vời đến cái kết đáng sợ và dị thường một cách thú vị… Mỗi dòng trong sách đều ngập không khí của cuộc chiến đấu với cái ác ở bản thể đen tối nhất của nó… Tôi chuẩn bị đặt cược rằng năm nay độc giả Observer sẽ không tìm được cuốn nào lôi cuốn hơn.”

- Robert McCrum, Observer

“[Thomas Harris là] Edgar Allan Poe thời nay.”

- Evening Standard");

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
-- TRÀ --
INSERT INTO DRINKS(drinksName, image)
VALUES ("Trà đào", "tradao.png"),
		("Trà vải", "travai.png"),
        ("Trà ổi hồng", "traoihong.png"),
        ("Trà bưởi dâu", "trabuoidau.png"),
        ("Trà dâu", "tradau.png"),
        ("Trà chanh sả biếc", "trachanhsabiec.png"),
        ("Trà đào cam sả", "tradaocamsa.png"),
        ("Trà tắc mật ong (nóng)", "tratacmatong.png"),
        ("Trà gừng mật ong (nóng)", "tragungmatong.png");
INSERT INTO DRINKS_SIZE(drinksId, size, price)
VALUES (1, "M", 35000),
        (1, "L", 42000),
		(2, "M", 35000),
        (2, "L", 42000),
		(3, "M", 35000),
        (3, "L", 42000),
		(4, "M", 35000),
        (4, "L", 42000),
		(5, "M", 35000),
		(5, "L", 42000),
		(6, "M", 40000),
		(6, "L", 48000),
		(7, "M", 38000),
        (7, "L", 45000),
		(8, "S", 32000),
		(8, "M", 40000),
		(9, "S", 32000),
		(9, "M", 40000);

-- CAFE --
INSERT INTO DRINKS(drinksName, image)
VALUES ("Cafe đen", "cafeden.png"),
		("Cafe sữa", "cafesua.png"),
        ("Bạc xỉu", "bacxiu.png"),
        ("Latte", "latte.png"),
        ("Cacao", "cacao.png");
INSERT INTO DRINKS_SIZE(drinksId, size, price)
VALUES (10, "S", 32000),
        (10, "M", 40000),
		(11, "S", 35000),
        (11, "M", 42000),
		(12, "S", 35000),
        (12, "M", 42000),
		(13, "S", 38000),
        (13, "M", 45000),
		(14, "S", 38000),
		(14, "M", 45000);

-- NƯỚC ÉP --
INSERT INTO DRINKS(drinksName, image)
VALUES ("Nước ép cam", "epcam.png"),
		("Nước ép cà rốt", "epcarot.png"),
        ("Nước ép thơm", "thom.png"),
        ("Nước ép táo", "eptao.png"),
        ("Nước ép cam cà rốt", "epcamcarot.png"),
        ("Nước ép sương sớm (táo, thơm, gừng)", "epsuongsom.png"),
        ("Nước ép ban mai (táo, chanh dây)", "epbanmai.png");
INSERT INTO DRINKS_SIZE(drinksId, size, price)
VALUES (15, "M", 35000),
        (15, "L", 42000),
		(16, "M", 35000),
        (16, "L", 42000),
		(17, "M", 35000),
        (17, "L", 42000),
		(18, "M", 35000),
        (18, "L", 42000),
		(19, "M", 38000),
		(19, "L", 45000),
		(20, "M", 42000),
		(20, "L", 50000),
		(21, "M", 42000),
		(21, "L", 50000);

-- ĐÁ XAY --
INSERT INTO DRINKS(drinksName, image)
VALUES ("Đá xay chocolate", "xaychocolate.png"),
		("Đá xay choco mint", "xaychocomint.png"),
		("Đá xay cookie", "xaycookie.png"),
		("Đá xay matcha", "xaymatcha.png");
INSERT INTO DRINKS_SIZE(drinksId, size, price)
VALUES (22, "M", 42000),
        (22, "L", 50000),
		(23, "M", 45000),
        (23, "L", 55000),
		(24, "M", 52000),
        (24, "L", 60000),
		(25, "M", 45000),
        (25, "L", 52000);