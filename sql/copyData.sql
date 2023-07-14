COPY review
    FROM '/Users/mr.lynes/dev/HACK_REACTOR/cyclops/data_dump/test/reviews.csv'
    WITH (
        FORMAT csv,
        HEADER true
    );

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