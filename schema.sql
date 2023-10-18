DROP TABLE IF EXISTS Contacts;
CREATE TABLE Contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company VARCHAR(255) NOT NULL,
    accountname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    delivery_id INTEGER
);