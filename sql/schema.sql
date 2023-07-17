DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS characteristic CASCADE;
DROP TABLE IF EXISTS characteristic_review CASCADE;
DROP TABLE IF EXISTS photo CASCADE;

CREATE TABLE review (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    rating INT NOT NULL,
    date TIMESTAMP DEFAULT(current_timestamp),
    tmp_date BIGINT NOT NULL,
    summary	VARCHAR(500),
    body VARCHAR(500),
    recommend BOOLEAN NOT NULL,
    reported BOOLEAN NOT NULL DEFAULT(false),
    reviewer_name VARCHAR(50),
    reviewer_email VARCHAR(50),
    response VARCHAR(250),
    helpfulness	INT NOT NULL DEFAULT(0)
);

CREATE TABLE characteristic (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE characteristic_review (
    id SERIAL PRIMARY KEY,
    characteristic_id INT NOT NULL,
    review_id INT NOT NULL,
    value INTEGER NOT NULL,
    CONSTRAINT fk_review
        FOREIGN KEY(review_id)
        REFERENCES review(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_characteristic
        FOREIGN KEY(characteristic_id)
        REFERENCES characteristic(id)
);

CREATE TABLE photo (
    id SERIAL PRIMARY KEY,
    review_id INT NOT NULL,
    url VARCHAR(200) NOT NULL,
    CONSTRAINT fk_review
        FOREIGN KEY(review_id)
        REFERENCES review(id)
        ON DELETE CASCADE
);

COPY review(id, product_id, rating, tmp_date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
    FROM '/Users/mr.lynes/dev/HACK_REACTOR/cyclops/data_dump/reviews.csv'
    WITH (
        FORMAT csv,
        HEADER true
    );

COPY characteristic
    FROM '/Users/mr.lynes/dev/HACK_REACTOR/cyclops/data_dump/characteristics.csv'
    WITH (
        FORMAT csv,
        HEADER true
    );
COPY characteristic_review
    FROM '/Users/mr.lynes/dev/HACK_REACTOR/cyclops/data_dump/characteristic_reviews.csv'
    WITH (
        FORMAT csv,
        HEADER true
    );
COPY photo
    FROM '/Users/mr.lynes/dev/HACK_REACTOR/cyclops/data_dump/reviews_photos.csv'
    WITH (
        FORMAT csv,
        HEADER true
    );

UPDATE review set date = to_timestamp(tmp_date/1000)::date;
ALTER TABLE review drop COLUMN tmp_date;
ALTER TABLE review ALTER column date SET DEFAULT(current_timestamp);

SELECT setval('review_id_seq', max(id)) FROM review;
SELECT setval('characteristic_id_seq', max(id)) FROM characteristic;
SELECT setval('characteristic_review_id_seq', max(id)) FROM characteristic_review;
SELECT setval('photo_id_seq', max(id)) FROM photo;

CREATE INDEX indx_review_productID ON review(product_id);
CREATE INDEX indx_characteristic_productID ON characteristic(product_id);
CREATE INDEX indx_characteristic_review_characteristic_id ON characteristic_review(characteristic_id);
