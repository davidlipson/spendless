import Koa from 'koa';
import cors from 'kcors';
import Router from 'koa-router';
import { DBClient } from './database';
import koaBody from 'koa-body';
import { lists } from './lists';
import * as dotenv from 'dotenv';
dotenv.config();

const {
    whitelist,
    blacklist,
    totalRegex,
    processButtonEndWords,
    processButtons,
} = lists;

const database = new DBClient();
database.createDatabase(process.env.RESTART === '1').then(() => {
    const router = new Router();
    const port = process.env.PORT || 5000;

    router.get('/user', async (ctx: any) => {
        try {
            const { uid } = ctx.query;
            const results = await database.getUser(uid as string);
            if (results.length === 0) {
                ctx.throw(404);
            }
            ctx.body = results;
        } catch (err) {
            console.log(err);
        }
    });

    router.post('/onboard', koaBody(), async (ctx: any) => {
        try {
            const { uid } = ctx.request.body as { uid: string };
            const results = await database.onboardUser(uid);
            if (results.length === 0) {
                ctx.throw(404);
            }
            ctx.body = results;
        } catch (err) {
            console.log(err);
        }
    });

    router.post('/add', koaBody(), async (ctx: any) => {
        try {
            const { uid, amount, description, tid } = ctx.request.body as {
                uid: string;
                amount: number;
                description: string;
                tid: string;
            };
            let newId = null;
            if (amount > 0) {
                newId = await database.addTransaction(
                    tid,
                    uid,
                    description,
                    amount
                );
            }
            const results = await database.getUser(uid as string);
            ctx.body = { total: results[0].spent, tid: newId };
        } catch (err) {
            console.log(err);
        }
    });

    router.post('/process', koaBody(), async (ctx: any) => {
        try {
            const { uid, tid } = ctx.request.body as {
                uid: string;
                tid: string;
            };
            if (uid && tid) {
                await database.confirmLastTransaction(uid, tid);
            }
            const results = await database.getUser(uid as string);
            ctx.body = { total: results[0].spent };
        } catch (err) {
            console.log(err);
        }
    });

    router.post('/budget', koaBody(), async (ctx: any) => {
        const { uid, budget } = ctx.request.body as {
            uid: string;
            budget: number;
        };
        const results = await database.updateBudget(uid, budget);
        ctx.body = results;
    });

    router.get('/history', async (ctx: any) => {
        const uid = ctx.query.uid as string;
        const { history, spent, recent } = await database.getHistory(uid);
        ctx.body = { history, spent, recent };
    });

    router.get('/recent', async (ctx: any) => {
        const uid = ctx.query.uid as string;
        const recent = await database.getRecentlyUnconfirmed(uid);
        ctx.body = recent;
    });

    router.get('/list', async (ctx: any) => {
        ctx.body = {
            whitelist,
            blacklist,
            totalRegex,
            processButtons,
            processButtonEndWords,
        };
    });

    router.post('/ignore', koaBody(), async (ctx: any) => {
        const { uid, id } = ctx.request.body as {
            uid: string;
            id: string;
        };
        const results = await database.ignoreTransaction(uid, id);
        if (results.rowCount === 0) {
            ctx.throw(404);
        }
        ctx.body = results;
    });

    router.post('/login', koaBody(), async (ctx: any) => {
        try {
            interface LoginRequestBody {
                email: string;
                first_name: string;
                last_name: string;
            }

            const { email, first_name, last_name } = ctx.request
                .body as LoginRequestBody;
            if (email?.length > 0) {
                const results = await database.loginUser(
                    email,
                    first_name,
                    last_name
                );
                if (results.length === 0) {
                    ctx.throw(404);
                }
                ctx.body = results;
            } else {
                throw 'Invalid email.';
            }
        } catch (e) {
            console.log(e);
        }
    });

    const app = new Koa();

    var options = {
        origin: '*',
    };

    app.use(cors(options));

    app.use(async (ctx: any, next: any) => {
        try {
            await next();
        } catch (err) {
            ctx.status = err.status || 500;
            ctx.body = err.message;
        }
    });

    app.use(router.routes());

    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
});
