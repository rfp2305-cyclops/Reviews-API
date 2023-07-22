import http from 'k6/http';
import { check, sleep} from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';


export const options = {
  thresholds: {
    http_req_failed: [
      {
        threshold: 'rate<0.01',
        abortOnFail: true, // boolean
        delayAbortEval: "10s", // string
      },
    ], // http errors should be less than 1%
    http_req_duration: [
      {
        threshold: 'p(99)<100',
        abortOnFail: true, // boolean
        delayAbortEval: "10s", // string
      },
    ],
  },
  // Key configurations for spike in this section
  stages: [
    {duration: '1m', target: 10},
    { duration: '2m', target: 2000 }, // fast ramp-up to a high point
    // No plateau
    { duration: '1m', target: 0 }, // quick ramp-down to 0 users
  ],
};


export default () => {
  let id = randomIntBetween(1, 5774952);
  const url = "http://3.91.152.73/reviews/meta?product_id=" + id;
  // const url = "http://3.91.152.73/reviews/meta?product_id=5";
  const payload = JSON.stringify({});
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  sleep(1);

  const res = http.get(url, payload, params);

  // check that response is 200
  check(res, {
    "response code was 200": (res) => res.status == 200,
    'has the correct product_id': (r) => r.json().product_id === id
  });
};