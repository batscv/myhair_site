const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
    };

    try {
        const connection = await mysql.createConnection(connectionConfig);
        console.log('Successfully connected to MySQL server.');

        const [rows] = await connection.query(`SHOW DATABASES LIKE '${process.env.DB_NAME}'`);
        if (rows.length > 0) {
            console.log(`Database "${process.env.DB_NAME}" exists.`);
            await connection.query(`USE ${process.env.DB_NAME}`);
            const [tables] = await connection.query('SHOW TABLES');
            console.log(`Tables in "${process.env.DB_NAME}":`, tables.length);
        } else {
            console.log(`Database "${process.env.DB_NAME}" does NOT exist.`);
        }
        await connection.end();
    } catch (error) {
        console.error('Error connecting to MySQL:', error.message);
    }
}

checkDB();
