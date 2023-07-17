import Router from 'express-promise-router'
import {
  createReview,
  getReviewMeta,
  getReviews,
  updateReviewHelpfulness,
  updateReviewReport
} from './controller';
const router = new Router();

/*
  GET /reviews
  QUERY PARAMETERS
    @page	      - integer	- Selects the page of results to return. Default 1.
    @count	    - integer	- Specifies how many results per page to return. Default 5.
    @sort	      - text    - Changes the sort order of reviews to be based on "newest", "helpful", or "relevant"
    @product_id	- integer	- Specifies the product for which to retrieve reviews.
*/
router.get('/reviews', async (req, res, next) => {
  const {product_id, page, count, sort} = req.query;
  if( !product_id )
    return res.sendStatus(500);

  const queryResult = await getReviews(product_id, count, page, sort);
  res.send(queryResult);
});



/*
  GET /reviews/meta
  QUERY PARAMETERS
    @product_id - integer - Required ID of the product for which data should be returned
*/
router.get('/reviews/meta', async (req, res, next) => {
  const {product_id} = req.query;
  if( !product_id )
    return res.sendStatus(500);

  const queryResult = await getReviewMeta(product_id);

  res.send(queryResult);
});


/*
  BODY PARAMETERS
    @product_id       -	integer       -	Required ID of the product to post the review for
    @rating           -	integer (1-5) - indicating the review rating
    @summary          -	text	        - Summary text of the review
    @body             -	text	        - Continued or full text of the review
    @recommend        -	bool	        - Value indicating if the reviewer recommends the product
    @name             -	text	        - Username for question asker
    @email            -	text	        - Email address for question asker
    @photos           -	[text]	      - Array of text urls that link to images to be shown
    @characteristics  -	object	      - Object of keys representing characteristic_id and values
                                        representing the review value for that characteristic. { "14": 5, "15": 5 //...}
*/
router.post('/reviews', async (req, res, next) => {
  const review = req.body;
  try{
    const result = await createReview(review);
    res.send(result);
  } catch(err) {
    console.log(err);
    res.sendStatus(500);
  }
});



/*
  PUT /reviews/:review_id/helpful
  PARAMETERS
    @review_id	  - integer - Required ID of the review to update
* */
router.put('/reviews/:review_id/helpful', async (req, res, next) => {
  const {review_id} = req.params;

  updateReviewHelpfulness(review_id)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});


/*
  PUT /reviews/:review_id/report
  PARAMETERS
    @review_id    - integer - Required ID of the review to update
*/
router.put('/reviews/:review_id/report', async (req, res, next) => {
  const {review_id} = req.params;
  updateReviewReport(review_id)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});


export default router;