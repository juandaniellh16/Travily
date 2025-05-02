DROP DATABASE IF EXISTS defaultdb;
CREATE DATABASE defaultdb;

USE defaultdb;

CREATE TABLE users (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500) DEFAULT NULL,
  followers INT UNSIGNED DEFAULT 0,
  following INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE followers (
  follower_id BINARY(16),
  following_id BINARY(16),
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  geoname_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  country_name VARCHAR(255),
  admin_name_1 VARCHAR(255),
  fcode VARCHAR(10),
  lat DOUBLE,
  lng DOUBLE,
  UNIQUE(geoname_id)
);

CREATE TABLE itineraries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(500) DEFAULT '',
  image VARCHAR(500) DEFAULT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location_id INT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  user_id BINARY(16) NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE itinerary_collaborators (
  itinerary_id INT NOT NULL,
  user_id BINARY(16) NOT NULL,
  PRIMARY KEY (itinerary_id, user_id),
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  itinerary_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, itinerary_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
);

CREATE TABLE itinerary_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itinerary_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  day_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
);

CREATE TABLE itinerary_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_id INT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  label VARCHAR(255) NOT NULL,
  description VARCHAR(500) DEFAULT '',
  category ENUM('landmark', 'food', 'accommodation', 'activity', 'transport', 'entertainment', 'shopping', 'art', 'relax', 'other') NOT NULL DEFAULT 'other',
  image VARCHAR(500) DEFAULT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE
);

CREATE TABLE itinerary_lists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(500) DEFAULT '',
  image VARCHAR(500) DEFAULT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  user_id BINARY(16) NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE itinerary_list_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  list_id INT NOT NULL,
  itinerary_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (list_id, itinerary_id),
  FOREIGN KEY (list_id) REFERENCES itinerary_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
);

CREATE TABLE likes_lists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  list_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, list_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (list_id) REFERENCES itinerary_lists(id) ON DELETE CASCADE
);