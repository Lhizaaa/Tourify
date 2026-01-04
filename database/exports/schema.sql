-- Create Database
DROP DATABASE IF EXISTS tourify;
CREATE DATABASE tourify;
USE tourify;

-- Tabel USERS
CREATE TABLE IF NOT EXISTS USERS (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    profile_picture VARCHAR(255),
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel CATEGORY
CREATE TABLE IF NOT EXISTS CATEGORY (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT
) ENGINE=InnoDB;

-- Tabel DESTINATION
CREATE TABLE IF NOT EXISTS DESTINATION (
    destination_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    location VARCHAR(100),
    price DECIMAL(10,2),
    category_id INT,
    image VARCHAR(255),
    maps_link VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
) ENGINE=InnoDB;

-- Tabel REVIEW
CREATE TABLE IF NOT EXISTS REVIEW (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    destination_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (destination_id) REFERENCES DESTINATION(destination_id)
) ENGINE=InnoDB;

-- Tabel ITINERARY
CREATE TABLE IF NOT EXISTS ITINERARY (
    itinerary_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id)
) ENGINE=InnoDB;

-- Tabel ItineraryDetail
CREATE TABLE IF NOT EXISTS ItineraryDetail (
    itinerary_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    itinerary_id INT,
    destination_id INT,
    day INT,
    notes TEXT,
    FOREIGN KEY (itinerary_id) REFERENCES ITINERARY(itinerary_id),
    FOREIGN KEY (destination_id) REFERENCES DESTINATION(destination_id)
) ENGINE=InnoDB;

-- Tabel TourGuide
CREATE TABLE IF NOT EXISTS TourGuide (
    guide_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    bio TEXT,
    contact VARCHAR(100),
    profile_picture VARCHAR(255),
    price DECIMAL(10,2) DEFAULT 0
) ENGINE=InnoDB;

-- Tabel BOOKING
CREATE TABLE IF NOT EXISTS BOOKING (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    destination_id INT,
    guide_id INT,
    booking_date DATE,
    ticket_quantity INT,
    total_price DECIMAL(10,2),
    status VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (destination_id) REFERENCES DESTINATION(destination_id),
    FOREIGN KEY (guide_id) REFERENCES TourGuide(guide_id)
) ENGINE=InnoDB;

-- Tabel PAYMENT
CREATE TABLE IF NOT EXISTS PAYMENT (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    payment_date DATE,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    amount DECIMAL(10,2),
    FOREIGN KEY (booking_id) REFERENCES BOOKING(booking_id)
) ENGINE=InnoDB;

-- Tabel ADMIN
CREATE TABLE IF NOT EXISTS ADMIN (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    profile_picture VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel ADMINACTIVITYLOG
CREATE TABLE IF NOT EXISTS ADMINACTIVITYLOG (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES ADMIN(admin_id)
) ENGINE=InnoDB;

INSERT INTO USERS (name, email, password, profile_picture, phone)
VALUES
('Fajar', 'fajar@example.com', 'hashedpass1', 'fajar.jpg', '08123456789'),
('Sinta', 'sinta@example.com', 'hashedpass2', 'sinta.jpg', '08234567890');