import {query} from './db';


function calculateAverageRating(ratings) {
  const sum = ratings.length;
  return ratings.reduce((a,b) => a + b.value , 0) / sum;
}

/*
  PARAMETERS
    @page	      - integer	- Selects the page of results to return. Default 1.
    @count	    - integer	- Specifies how many results per page to return. Default 5.
    @sort	      - text    - Changes the sort order of reviews to be based on "newest", "helpful", or "relevant"
    @product_id	- integer	- Specifies the product for which to retrieve reviews.
*/
export async function getReviews(product_id, count=10, page=0, sort='asc') {
  try{
    const res = await query(
      `SELECT * FROM review WHERE product_id = $1 LIMIT $2`,
      [product_id, count]
    );
    return {
      page,
      product: product_id,
      count: res.rowCount,
      results: res.rows
    };
  } catch(err) {
    console.error(err);
  }
}


/*
-- BRUTE FORCE SLOWEST DUMBEST SIMPLEST
    - fetch all product reviews
      - sum(reviews stars (1-5))
    - fetch all product characteristics
      - for each characteristic
        - fetch all characteristic_reviews
          - avg( each characteristic review )

-- CREATE TABLE PRODUCT_REVIEW_META
    - store meta for each product
    - update product_review_meta on review submission

-- SOME OTHER BRILLIANT METHOD TO SMART FOR ME
    ..........
*/



export async function getReviewMeta(product_id) {

  const ratings = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0
  };
  await query(
    `SELECT COUNT(rating), rating FROM review WHERE product_id = $1 GROUP BY rating ORDER BY rating`,
    [product_id]
  ).then(({rows}) => {
    rows.forEach(({count, rating}) => {
      ratings[rating] = count;
    })
  });

  const recommended = await query(
    `SELECT COUNT(recommend), recommend FROM review WHERE product_id = $1 GROUP BY recommend`,
    [product_id]
  ).then(({rows}) =>
    rows.reduce((a, {recommend, count}) => {
      a[String(recommend)] = Number(count);
      return a;
    }, {})
  );

  const characteristics = await query(`
        SELECT char.id characteristic_id, name, ROUND(AVG(value), 4) AS average_value
        FROM characteristic char
        FULL JOIN characteristic_review char_rev 
            ON char_rev.characteristic_id = char.id
        WHERE product_id = $1
        GROUP BY char.id, name;
    `, [product_id]
  ).then(({rows}) =>
    rows.reduce((a, b) => {
      a[b.name] = {
        id: b.characteristic_id,
        value:Number(b.average_value) || null
      }
      return a;
    }, {})
  );

  return {
    ratings,
    recommended,
    characteristics,
    product: product_id
  }
}

export async function createReview(review) {
  try {
    const reviewInsertResult = await query(
      `INSERT INTO review(product_id, rating, summary, body, recommend, reviewer_name, reviewer_email) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [review.product_id, review.rating, review.summary, review.body, review.recommend, review.name, review.email]
    );
    const insertId = reviewInsertResult.rows[0].id;

    await Promise.all(review.photos.map((url) =>
      query(
        `INSERT INTO photo(review_id, url) VALUES($1, $2)`,
        [insertId, url]
      )
    ));

    await Promise.all(Object.keys(review.characteristics).map((key) =>
      query(
        `INSERT INTO characteristic_review(characteristic_id, review_id, value) VALUES($1, $2, $3)`,
        [Number(key), insertId, review.characteristics[key]]
      )
    ));

    return {insertId};
  } catch(err) {
    throw Error(err);
  }
}

export async function updateReviewHelpfulness(review_id) {
  try{
    const result = await query(
      `UPDATE review 
            SET helpfulness = helpfulness + 1
            WHERE id = $1
      `, [review_id]
    );

    return result;
  } catch(err) {
    throw Error(err);
  }
}

export async function updateReviewReport(review_id) {
  try{
    const result = await query(
      `UPDATE review 
            SET reported = true
            WHERE id = $1
      `, [review_id]
    );
    return result;
  } catch(err) {
    throw Error(err);
  }
}
