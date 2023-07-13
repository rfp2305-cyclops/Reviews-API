require('dotenv').config();
const path = require('path');
const { Client } = require('pg');
const client = new Client();

client.connect()
  .then(() => {
    return Promise.all([
      client.query(`
        COPY review
          FROM '${path.join(__dirname, '../../data_dump/test/reviews.csv')}'
          WITH (
            FORMAT csv,
            HEADER true
          )
      `),
      client.query(`
        COPY characteristic
          FROM '${path.join(__dirname, '../../data_dump/test/characteristics.csv')}'
          WITH (
            FORMAT csv,
            HEADER true
          )
      `),
      client.query(`
        COPY characteristic_review
          FROM '${path.join(__dirname, '../../data_dump/test/characteristic_reviews.csv')}'
          WITH (
            FORMAT csv,
            HEADER true
          )
      `),
      client.query(`
        COPY photo
          FROM '${path.join(__dirname, '../../data_dump/test/reviews_photos.csv')}'
          WITH (
            FORMAT csv,
            HEADER true
          )
      `)
    ]);
  })
  .then((res) => {
    return client.end();
  })
  .catch(err => {
    console.log(err)
  })
  .finally(() => {
    return client.end();
  });
