const { Pool } = require('pg')

class Database {
    async connect() {
        try {
            if (global.connection)
                return global.connection.connect()
    
            const pool = new Pool({
                user: process.env.DB_USER,
                database: process.env.DB_NAME,
                password: process.env.DB_PASSWORD,
                host: process.env.DB_HOST,
                port: process.env.DB_PORT
            })
    
            const client = await pool.connect()
            console.log('Connected to PostgreSQL 🐘')
    
            const res = await client.query('SELECT NOW()')
            console.log(res.rows[0])
            client.release()
    
            global.connection = pool
            return pool.connect()
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async close() {
        try {
            if (global.connection) {
                await global.connection.end()
                console.log('Disconnected from PostgreSQL 🐘')
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async get(table) {
        try {
            const client = await this.connect()
            const res = await client.query(`SELECT * FROM ${table}`)
            client.release()
            return res.rows
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getById(table, id) {
        try {
            const client = await this.connect()
            const res = await client.query(`SELECT * FROM ${table} WHERE id = $1`, [id])
            client.release()
            return res.rows
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async getJob (id) {
        try {
            const client = await this.connect()
            const res = await client.query(`SELECT j.*, c.name AS company_name FROM jobs AS j INNER JOIN companies AS c ON j.company_id = c.id WHERE j.id = $1`, [id])
            client.release()
            return res.rows
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async create(table, data) {
        try {
            const client = await this.connect()
            const keys = Object.keys(data)
            const values = Object.values(data)
            const res = await client.query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')})`, values)
            client.release()
            return res
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async update(table, id, data) {
        try {
            const client = await this.connect()
            const keys = Object.keys(data)
            const values = Object.values(data)
            const res = await client.query(`UPDATE ${table} SET ${keys.map((key, i) => `${key} = $${i + 1}`).join(', ')} WHERE id = $${keys.length + 1}`, [...values, id])
            client.release()
            return res
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async delete(table, id) {
        try {
            const client = await this.connect()
            const res = await client.query(`DELETE FROM ${table} WHERE id = $1`, [id])
            client.release()
            return res
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = new Database()