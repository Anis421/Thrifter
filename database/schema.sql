-- Database Schema for ShopGoodwill-like Website
CREATE Database IF NOT EXISTS shop_goodwill;
USE shop_goodwill;
-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(30),
  zip_code VARCHAR(20),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INT,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products Table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT,
  image_url VARCHAR(255),
  item_condition VARCHAR(50),
  seller_id INT NOT NULL,
  status ENUM('active', 'sold', 'pending') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shopping Cart Table
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  billing_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert some sample categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Apparel and accessories'),
('Home & Garden', 'Items for home and garden'),
('Collectibles', 'Collectible items and memorabilia'),
('Furniture', 'Household furniture');

-- Insert some sample users (password is 'password' hashed)
INSERT INTO users (username, email, password, first_name, last_name) VALUES
('john_doe', 'john@example.com', '$2b$10$6j7NCZ0FMwbFXV3X4T7M5O6A.c4JLGc6.f8VKK6svR3G8JB2hGXeS', 'John', 'Doe'),
('jane_smith', 'jane@example.com', '$2b$10$6j7NCZ0FMwbFXV3X4T7M5O6A.c4JLGc6.f8VKK6svR3G8JB2hGXeS', 'Jane', 'Smith');

-- Insert some sample products
INSERT INTO products (title, description, price, category_id, image_url, item_condition, seller_id) VALUES
('Vintage Record Player', 'Classic record player in excellent condition', 149.99, 1, '/images/record-player.jpg', 'Good', 1),
('Leather Jacket', 'Genuine leather jacket, size L', 89.99, 2, '/images/leather-jacket.jpg', 'Excellent', 2),
('Antique Coffee Table', 'Wooden coffee table from the 1950s', 199.99, 5, '/images/coffee-table.jpg', 'Fair', 1),
('Comic Book Collection', 'Collection of rare comic books', 299.99, 4, '/images/comics.jpg', 'Good', 2),
('Garden Tools Set', 'Complete set of gardening tools', 59.99, 3, '/images/garden-tools.jpg', 'New', 1);