import { check } from "k6";
import http from "k6/http";

export const options = {
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.01", abortOnFail: true }],
    http_req_duration: ['p(99)<1000'],
  },
  scenarios: {
    // define scenarios
    breaking: {
      executor: "ramping-vus",
      stages: [
        { duration: "10s", target: 20 },
        { duration: "50s", target: 20 },
        { duration: "50s", target: 40 },
        { duration: "50s", target: 60 },
        { duration: "50s", target: 80 },
        { duration: "50s", target: 100 },
        { duration: "50s", target: 120 },
        { duration: "50s", target: 140 },
        //....
      ],
    },
  },
}

export default function () {
  // define URL and request body
  const url = "http://localhost:4878/reviews/?product_id=1";
  const payload = JSON.stringify({
    /*username: "test_case",
    password: "1234",*/
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.get(url, payload, params);

  // check that response is 200
  check(res, {
    "response code was 200": (res) => res.status == 200,
  });
}