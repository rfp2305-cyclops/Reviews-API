DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS characteristic CASCADE;
DROP TABLE IF EXISTS characteristic_review CASCADE;
DROP TABLE IF EXISTS photo CASCADE;

CREATE TABLE review (
    id SERIAL PRIMARY KEY,
    product_id CHAR(50),
    rating INT NOT NULL,
    date TIMESTAMP,
    tmp_date BIGINT NOT NULL,
    summary	VARCHAR(100),
    body VARCHAR(250),
    recommend BOOLEAN NOT NULL,
    reported BOOLEAN NOT NULL,
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
    review_id INT NOT NULL,
    characteristic_id INT NOT NULL,
    value VARCHAR(50) NOT NULL,
    CONSTRAINT fk_review
        FOREIGN KEY(review_id)
        REFERENCES review(id),
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
);

COPY review(id, product_id, rating, tmp_date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
    FROM '/Users/mr.lynes/dev/HACK_REACTOR/cyclops/data_dump/test/reviews.csv'
    WITH (
        FORMAT csv,
        HEADER true
    );

UPDATE review set date = to_timestamp(tmp_date/1000)::date;
alter TABLE review drop COLUMN tmp_date;

COPY characteristic
    FROM '/Users/mr.lynes/dev/HACK_REACTOR/cyclops/data_dump/test/characteristics.csv'
    WITH (
        FORMAT csv,
        HEADER true
    );
COPY characteristic_review
    FROM '/Users/mr.lynes/dev/HACK_REACTOR/cyclops/data_dump/test/characteristic_reviews.csv'
    WITH (
        FORMAT csv,
        HEADER true
    );
COPY photo
    FROM '/Users/mr.lynes/dev/HACK_REACTOR/cyclops/data_dump/test/reviews_photos.csv'
    WITH (
        FORMAT csv,
        HEADER true
    );


