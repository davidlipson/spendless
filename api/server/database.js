const postgres = require('pg');

module.exports = class DBClient {
    client;
    constructor() {
        this.client = null;
    }

    createDatabase = async (init = false) => {
        if (process.env.NODE_ENV === 'production') {
            this.client = await new postgres.Client({
                user: process.env.PG_USER,
                password: process.env.PG_PASSWORD,
                database: process.env.PG_DB,
                port: process.env.PG_PORT,
                host: process.env.PG_HOST,
                ssl: {
                    rejectUnauthorized: false,
                },
            });
        } else {
            this.client = await new postgres.Client({
                user: process.env.PG_USER,
                password: process.env.PG_PASSWORD,
                port: process.env.PG_PORT,
                host: process.env.PG_HOST,
                ssl: {
                    rejectUnauthorized: false,
                },
            });
        }

        await this.client.connect();
        if (init === true) {
            try {
                if (process.env.NODE_ENV !== 'production') {
                    await this.client.query(
                        `CREATE DATABASE "${process.env.PG_DB}"`
                    );
                }
                await this.client.query(`CREATE TABLE "user" (
                    id uuid NOT NULL DEFAULT gen_random_uuid(),
                    first_name varchar NULL,
                    last_name varchar NULL,
                    email varchar NOT NULL,
                    budget float8 NOT NULL DEFAULT 100,
                    spent float8 NULL DEFAULT 0,
                    CONSTRAINT user_check CHECK ((budget > (0)::double precision)),
                    CONSTRAINT user_pk PRIMARY KEY (id),
                    CONSTRAINT user_un UNIQUE (email)
                );`);
                await this.client.query(`CREATE TABLE "url" (
                    uid uuid NOT NULL,
                    url text NULL,
                    amount float8 NULL,
                    description varchar NULL,
                    CONSTRAINT url_pk PRIMARY KEY (uid),
                    CONSTRAINT lasttab_fk FOREIGN KEY (uid) REFERENCES "user"(id)
                );`);
                await this.client.query(`CREATE TABLE "transaction" (
                    id uuid NOT NULL DEFAULT gen_random_uuid(),
                    uid uuid NOT NULL,
                    "timestamp" timestamp NOT NULL DEFAULT now(),
                    description varchar NOT NULL,
                    amount float8 NOT NULL DEFAULT 0,
                    ignored bool NULL DEFAULT false,
                    CONSTRAINT transaction_fk FOREIGN KEY (uid) REFERENCES "user"(id)
                );`);
                await this.client.query(`CREATE TABLE "monthly" (
                    id uuid NOT NULL DEFAULT gen_random_uuid(),
                    uid uuid NOT NULL,
                    budget float8 NOT NULL,
                    amount float8 NOT NULL,
                    CONSTRAINT monthly_pk PRIMARY KEY (id),
                    CONSTRAINT monthly_fk FOREIGN KEY (uid) REFERENCES "user"(id)
                );`);
                return true;
            } catch (error) {
                await this.client.end();
                throw error;
            }
        }
        return true;
    };

    getUser = async (uid) => {
        const query = `select * from "user" where id = '${uid}' limit 1`;
        try {
            const results = await this.client.query(query);
            return results.rows;
        } catch (err) {
            throw err;
        }
    };
    setPage = async (uid, url, amount, description) => {
        const query = `INSERT INTO "url" (uid, url, amount, description) VALUES('${uid}', '${url}', ${amount}, '${description}') ON CONFLICT (uid) DO UPDATE SET url=EXCLUDED.url, amount=EXCLUDED.amount, description=EXCLUDED.description`;
        try {
            const results = await this.client.query(query);
            return results.rows;
        } catch (err) {
            throw err;
        }
    };
    getHistory = async (uid) => {
        const query = `select * from "transaction" where uid = '${uid}'::uuid::uuid and ignored is false order by timestamp desc`;
        try {
            const results = await this.client.query(query);
            return results.rows;
        } catch (err) {
            throw err;
        }
    };
    ignoreTransaction = async (uid, id) => {
        const query = `update "transaction" set ignored = true where uid='${uid}'::uuid::uuid and id='${id}'::uuid::uuid`;
        try {
            const results = await this.client.query(query);
            return results;
        } catch (err) {
            throw err;
        }
    };
    updateBudget = async (uid, budget) => {
        const query = `update "user" set budget = ${budget} where id='${uid}'::uuid::uuid`;
        try {
            const results = await this.client.query(query);
            return results;
        } catch (err) {
            throw err;
        }
    };
    addLastTransaction = async (uid) => {
        const query = `INSERT INTO transaction (uid, description, amount)
                        (SELECT uid, description, amount FROM url
                        WHERE uid = '${uid}' and amount > 0)`;
        try {
            const results = await this.client.query(query);
            return results;
        } catch (err) {
            throw err;
        }
    };
    loginUser = async (email, first_name, last_name) => {
        const query = `
            with s as (
                select *
                from "user"
                where email = '${email}'
            ), i as (
                insert into "user" ("email", "first_name", "last_name")
                select '${email}', '${first_name}', '${last_name}'
                where not exists (select 1 from s)
                returning *
            )
            select *
            from i
            union all
            select * 
            from s
        `;

        try {
            const results = await this.client.query(query);
            return results.rows;
        } catch (err) {
            throw err;
        }
    };
};
