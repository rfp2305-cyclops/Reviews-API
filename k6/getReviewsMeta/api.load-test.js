// Import necessary modules
import { check } from "k6";
import http from "k6/http";
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  // define thresholds
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(99)<200'], // 99% of requests should be below 200ms
  },
  // define scenarios
  scenarios: {
    // arbitrary name of scenario
    average_load: {
      executor: "ramping-vus",
      stages: [
        // ramp up to average load of 20 virtual users
        { duration: "10s", target: 20 },
        // maintain load
        { duration: "50s", target: 100 },
        // ramp down to zero
        { duration: "5s", target: 0 },
      ],
    },
  }
};

export default function () {
  // define URL and request body
  let id = randomIntBetween(1, 5774952);
  const url = "http://127.0.0.1:4878/reviews/meta?product_id=" + id;
  const payload = JSON.stringify({});
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.get(url, payload, params);

  // check that response is 200
  check(res, {
    "response code was 200": (res) => res.status == 200,
    'has the correct product_id': (r) => r.json().product === id
  });
}