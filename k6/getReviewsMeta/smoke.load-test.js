import http from 'k6/http';
import { check, sleep} from 'k6';

export const options = {
  vus: 3, // Key for Smoke k6. Keep it at 2, 3, max 5 VUs
  duration: '1m', // This can be shorter or just a few iterations
};

export default () => {
  const url = "http://3.80.220.94/reviews/?product_id=2";
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
  });
};