require('dotenv').config();
import {Pool} from 'pg';


export default function DB() {
  try {
    const pool = new Pool();
    return (text, params) => pool.query(text, params);
  } catch(err) {
    console.error(err);
    throw Error(err);
  }
}