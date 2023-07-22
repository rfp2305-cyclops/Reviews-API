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
    throw new Error(err);
  }
}

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

export async function createReview(review) {
  try {
    const reviewInsertResult = await query(
      `INSERT INTO 
        review(product_id, rating, summary, body, recommend, reviewer_name, reviewer_email) 
        VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
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
    return await query(
      `UPDATE review
          SET helpfulness = helpfulness + 1
          WHERE id = $1
      `, [review_id]
    );
  } catch(err) {
    throw Error(err);
  }
}

export async function updateReviewReport(review_id) {
  try{
    return await query(
      `UPDATE review 
          SET reported = true
          WHERE id = $1
      `, [review_id]
    );
  } catch(err) {
    throw Error(err);
  }
}
