-- =====================================
-- CREAR TABLA ROLES
-- =====================================
CREATE TABLE IF NOT EXISTS roles (
                       id_rol BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       rol_name VARCHAR(100) NOT NULL
);

-- =====================================
-- CREAR TABLA USERS
-- =====================================
CREATE TABLE IF NOT EXISTS users (
                       id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       email VARCHAR(250) NOT NULL UNIQUE,
                       name VARCHAR(100) NOT NULL,
                       password VARCHAR(250) NOT NULL,
                       role_id BIGINT,
                       address VARCHAR(250),
                       phone VARCHAR(15),
                       creacion_date DATE,
                       birth_date DATE,
                       gender VARCHAR(1),

                       CONSTRAINT fk_users_role
                           FOREIGN KEY (role_id) REFERENCES roles(id_rol)
);

-- =====================================
-- CREAR TABLA PRODUCTS
-- =====================================
CREATE TABLE IF NOT EXISTS products (
                          id_product BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          category VARCHAR(100),
                          description_product TEXT,
                          image_product VARCHAR(250),
                          name_product VARCHAR(50),
                          price NUMERIC(10,2),
                          publication_date DATE,
                          unit VARCHAR(250),
                          user_id BIGINT,
                          stock INTEGER,
                          discount_percentage NUMERIC(5,2),

                          CONSTRAINT fk_products_user
                              FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================
-- CREAR TABLA PRODUCT_IMAGES
-- =====================================
CREATE TABLE IF NOT EXISTS product_images (
                                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                image_url VARCHAR(255),
                                product_id BIGINT,

                                CONSTRAINT fk_images_product
                                    FOREIGN KEY (product_id) REFERENCES products(id_product)
);

-- =====================================
-- CREAR TABLA COMMENTS
-- =====================================
CREATE TABLE IF NOT EXISTS comments (
                          id_comment BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          comment_commenter TEXT,
                          creation_comment DATE,
                          email_commenter VARCHAR(100),
                          name_commenter VARCHAR(100),
                          product_id BIGINT,
                          user_id BIGINT,
                          comment_type VARCHAR(20),
                          rating INTEGER,

                          CONSTRAINT fk_comments_product
                              FOREIGN KEY (product_id) REFERENCES products(id_product),

                          CONSTRAINT fk_comments_user
                              FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================
-- CREAR TABLA PAYMENTS
-- =====================================
CREATE TABLE IF NOT EXISTS payments (
                          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          order_id BIGINT,
                          payer_email VARCHAR(255),
                          preference_id VARCHAR(255),
                          status VARCHAR(255)
);

-- =====================================
-- CREAR TABLA PAYMENT_ITEMS
-- =====================================
CREATE TABLE IF NOT EXISTS payment_items (
                               id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                               quantity INTEGER,
                               title VARCHAR(255),
                               unit_price NUMERIC(38,2),
                               payment_id BIGINT,

                               CONSTRAINT fk_payment_items_payment
                                   FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- =====================================
-- CREAR TABLA CHAT_SOCIAL
-- =====================================
CREATE TABLE IF NOT EXISTS chat_social (
                             id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                             content TEXT,
                             sender_name VARCHAR(100),
                             timestamp TIMESTAMP WITH TIME ZONE,
                             user_id BIGINT,

                             CONSTRAINT fk_chat_user
                                 FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);