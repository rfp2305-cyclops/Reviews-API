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

  const recommended = {
    "true": 0,
    "false" : 0
  };
  await query(
    `SELECT COUNT(recommend), recommend FROM review WHERE product_id = $1 GROUP BY recommend`,
    [product_id]
  ).then(({rows}) => {
    rows.forEach(({recommend, count}) => {
      recommended[recommend] = count;
    })
  });

  const characteristics = {};
  await query(
    `SELECT id, name FROM characteristic WHERE product_id = $1`,
    [product_id]
  ).then(({rows}) => {
    rows.forEach((row) => {
      characteristics[row.name] = {
        id: row.id
      };
    })
  });

  await Promise.all(Object.keys(characteristics).map(async (key) => {
    await query(
      `SELECT value FROM characteristic_review WHERE characteristic_id = $1`,
      [characteristics[key].id]
    ).then((r) => {
      characteristics[key].value = calculateAverageRating(r.rows);
    })
  }));

  return {
    ratings,
    recommended,
    characteristics,
    product: product_id
  }
}
