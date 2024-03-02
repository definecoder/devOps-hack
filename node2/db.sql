CREATE DATABASE devops;
USE devops;

CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(255) PRIMARY KEY,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255),
    content TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Insert dummy data into the Users table
INSERT INTO Users (id) VALUES ('1');
INSERT INTO Users (id) VALUES ('2');
INSERT INTO Users (id) VALUES ('3');


-- Insert dummy data into the Posts table
INSERT INTO Posts (userId, content) VALUES ('1', 'Post 1 by user 1');
INSERT INTO Posts (userId, content) VALUES ('1', 'Post 2 by user 1');
INSERT INTO Posts (userId, content) VALUES ('2', 'Post 1 by user 2');
INSERT INTO Posts (userId, content) VALUES ('3', 'Post 1 by user 3');
INSERT INTO Posts (userId, content) VALUES ('3', 'Post 2 by user 3');
INSERT INTO Posts (userId, content) VALUES ('3', 'Post 3 by user 3');


