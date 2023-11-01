"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBClient = void 0;
const pg_1 = require("pg");
class DBClient {
    constructor() {
        this.createDatabase = (init = false) => __awaiter(this, void 0, void 0, function* () {
            if (init) {
                console.log('restarting db...');
            }
            if (process.env.NODE_ENV === 'production') {
                this.client = yield new pg_1.Client({
                    user: process.env.PG_USER,
                    password: process.env.PG_PASSWORD,
                    database: process.env.PG_DB,
                    port: parseInt(process.env.PG_PORT),
                    host: process.env.PG_HOST,
                    ssl: {
                        rejectUnauthorized: false,
                    },
                });
            }
            else {
                this.client = yield new pg_1.Client({
                    user: process.env.PG_USER,
                    password: process.env.PG_PASSWORD,
                    port: parseInt(process.env.PG_PORT),
                    host: process.env.PG_HOST,
                    ssl: false,
                });
            }
            yield this.client.connect();
            if (init === true) {
                try {
                    yield this.client.query('DROP SCHEMA IF EXISTS public CASCADE');
                    yield this.client.query('CREATE SCHEMA public');
                    yield this.client.query(`CREATE TABLE "user" (
                    id uuid NOT NULL DEFAULT gen_random_uuid(),
                    first_name varchar NULL,
                    last_name varchar NULL,
                    email varchar NOT NULL,
                    budget float8 NOT NULL DEFAULT 100,
                    spent float8 NULL DEFAULT 0,
                    onboarded bool NULL DEFAULT false,
                    CONSTRAINT user_check CHECK ((budget > (0)::double precision)),
                    CONSTRAINT user_pk PRIMARY KEY (id),
                    CONSTRAINT user_un UNIQUE (email)
                );`);
                    yield this.client.query(`CREATE TABLE "transaction" (
                    id uuid NOT NULL DEFAULT gen_random_uuid(),
                    uid uuid NOT NULL,
                    "timestamp" timestamp NOT NULL DEFAULT now(),
                    description varchar NOT NULL,
                    amount float8 NOT NULL DEFAULT 0,
                    ignored bool NULL DEFAULT false,
                    confirmed bool NULL DEFAULT false,
                    CONSTRAINT transaction_fk FOREIGN KEY (uid) REFERENCES "user"(id)
                );`);
                    yield this.client.query(`CREATE OR REPLACE FUNCTION update_user_spent_function() RETURNS TRIGGER AS $$
                    BEGIN
                      IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
                        UPDATE "user"
                        SET spent = (SELECT SUM(amount) FROM "transaction" WHERE uid = NEW.uid AND confirmed IS TRUE AND ignored IS FALSE AND timestamp >= date_trunc('month', CURRENT_DATE))
                        WHERE id = NEW.uid;
                      END IF;
                      RETURN NEW;
                    END;
                    $$ LANGUAGE plpgsql;
                    
                    CREATE TRIGGER update_user_spent
                    AFTER INSERT OR UPDATE OR DELETE ON "transaction"
                    FOR EACH ROW
                    EXECUTE FUNCTION update_user_spent_function();`);
                    return true;
                }
                catch (error) {
                    console.log(error);
                    yield this.client.end();
                    throw error;
                }
            }
            return true;
        });
        this.getUser = (uid) => __awaiter(this, void 0, void 0, function* () {
            const query = `select * from "user" where id = '${uid}'`;
            try {
                const results = yield this.client.query(query);
                return results.rows;
            }
            catch (err) {
                throw err;
            }
        });
        this.getHistory = (uid) => __awaiter(this, void 0, void 0, function* () {
            const query = `select * from "transaction" where uid = '${uid}'::uuid::uuid and ignored is false and confirmed is true and timestamp >= date_trunc('month', CURRENT_DATE) order by timestamp desc`;
            try {
                const results = yield this.client.query(query);
                const user = yield this.getUser(uid);
                const recent = yield this.getRecentlyUnconfirmed(uid);
                return { history: results.rows, spent: user[0].spent, recent };
            }
            catch (err) {
                throw err;
            }
        });
        this.getRecentlyUnconfirmed = (uid) => __awaiter(this, void 0, void 0, function* () {
            const query = `select * from "transaction" where uid = '${uid}'::uuid::uuid and confirmed is false and ignored is false and 
        timestamp = (select maxts from (select max(timestamp) as maxts from transaction where uid = '${uid}' and confirmed is false) as mts) limit 1`;
            try {
                const results = yield this.client.query(query);
                if (results.rows.length === 0) {
                    yield this.addTransaction(null, uid, '', 0);
                    return yield this.getRecentlyUnconfirmed(uid);
                }
                return results.rows;
            }
            catch (err) {
                throw err;
            }
        });
        this.ignoreTransaction = (uid, id) => __awaiter(this, void 0, void 0, function* () {
            const query = `update "transaction" set ignored = true where uid='${uid}'::uuid::uuid and id='${id}'::uuid::uuid`;
            try {
                const results = yield this.client.query(query);
                return results;
            }
            catch (err) {
                throw err;
            }
        });
        this.updateBudget = (uid, budget) => __awaiter(this, void 0, void 0, function* () {
            const query = `update "user" set budget = ${budget} where id='${uid}'::uuid::uuid`;
            try {
                const results = yield this.client.query(query);
                return results;
            }
            catch (err) {
                throw err;
            }
        });
        this.confirmLastTransaction = (uid, tid) => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE "transaction" SET confirmed = true WHERE uid = '${uid}' and amount > 0 and id = '${tid}' RETURNING id, amount`;
            try {
                const results = yield this.client.query(query);
                return results;
            }
            catch (err) {
                throw err;
            }
        });
        this.addTransaction = (tid, uid, description, amount) => __awaiter(this, void 0, void 0, function* () {
            let query = `insert into "transaction" ("description", "amount", "uid") values ('${description}', '${amount}', '${uid}') RETURNING id`;
            if (tid) {
                query = `update "transaction" set description = '${description}', amount = '${amount}', timestamp = NOW() where id = '${tid}' and uid = '${uid}' RETURNING id`;
            }
            try {
                const results = yield this.client.query(query);
                return results.rows[0].id;
            }
            catch (err) {
                throw err;
            }
        });
        this.onboardUser = (uid) => __awaiter(this, void 0, void 0, function* () {
            const query = `update "user" set onboarded = true where id = '${uid}'
                returning *`;
            try {
                const results = yield this.client.query(query);
                return results.rows;
            }
            catch (err) {
                throw err;
            }
        });
        this.loginUser = (email, first_name, last_name) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            with s as (
                select * from "user" where email = '${email}'
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
                const results = yield this.client.query(query);
                return results.rows;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.DBClient = DBClient;
//# sourceMappingURL=database.js.map