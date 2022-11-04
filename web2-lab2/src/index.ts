import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config({path: require('find-config')('.env')})
const pool = new Pool({
   connectionString: "postgres://sretnoime:I3xF431RYa7G5lO1ni6n53U6DdS4qChg@dpg-cdfeiu5a4992md4fuojg-a.frankfurt-postgres.render.com/web2_baza",
   user: process.env.DB_USER,
   host: process.env.DB_HOST,
   database: process.env.DB_NAME,
   password: process.env.DB_PASSWORD,
   port: 5432,
   ssl:true
})

export async function getInfo(username:any) {
   var statement = 'SELECT name,surname,username,mail from "Users" WHERE username=\''+username+'\'';
   console.log(statement)
   const results = await pool.query(statement);
   if(results.rowCount==0)
      return null;
   return results.rows;
}
