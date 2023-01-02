const Koa = require('koa');
const cors = require('kcors');
const Router = require('koa-router');
const DBClient = require('./database');
const koaBody = require('koa-body');
const { whitelist, blacklist, totalRegex } = require('./lists');

const database = new DBClient();
database.createDatabase().then(() => {
    const router = new Router();
    const port = process.env.PORT || 5000;

    router.get('/user', async (ctx) => {
        try {
            const { uid } = ctx.query;
            const results = await database.getUser(uid);
            if (results.length === 0) {
                ctx.throw(404);
            }
            ctx.body = results;
        } catch (err) {
            console.log(err);
        }
    });

    router.post('/onboard', koaBody(), async (ctx) => {
        try {
            const { uid } = ctx.request.body;
            const results = await database.onboardUser(uid);
            if (results.length === 0) {
                ctx.throw(404);
            }
            ctx.body = results;
        } catch (err) {
            console.log(err);
        }
    });

    router.post('/add', koaBody(), async (ctx) => {
        try {
            const { uid, amount, description, lastPurchase, tid } =
                ctx.request.body;
            let newId = tid;
            if (lastPurchase && tid) {
                await database.confirmLastTransaction(uid, tid);
            } else if (amount > 0) {
                newId = await database.addTransaction(
                    tid,
                    uid,
                    description,
                    amount
                );
            }
            const total = await database.getTotal(uid);
            ctx.body = { total, tid: newId };
        } catch (err) {
            console.log(err);
        }
    });

    router.post('/budget', koaBody(), async (ctx) => {
        const { uid, budget } = ctx.request.body;
        const results = await database.updateBudget(uid, budget);
        ctx.body = results;
    });

    router.get('/history', async (ctx) => {
        const { uid } = ctx.query;
        const { history, spent, recent } = await database.getHistory(uid);
        ctx.body = { history, spent, recent };
    });

    router.get('/recent', async (ctx) => {
        const { uid } = ctx.query;
        const recent = await database.getRecentlyUnconfirmed(uid);
        ctx.body = recent;
    });

    router.get('/list', async (ctx) => {
        ctx.body = { whitelist, blacklist, totalRegex };
    });

    router.post('/ignore', koaBody(), async (ctx) => {
        const { uid, id } = ctx.request.body;
        const results = await database.ignoreTransaction(uid, id);
        if (results.length === 0) {
            ctx.throw(404);
        }
        ctx.body = results;
    });

    router.post('/login', koaBody(), async (ctx) => {
        try {
            const { email, first_name, last_name } = ctx.request.body;
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

    // Setup Koa app
    const app = new Koa();

    // Apply CORS config
    var options = {
        origin: '*',
    };

    app.use(cors(options));

    // Log all requests
    app.use(async (ctx, next) => {
        const start = Date.now();
        await next(); // This will pause this function until the endpoint handler has resolved
        const responseTime = Date.now() - start;
    });

    // Error Handler - All uncaught exceptions will percolate up to here
    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            ctx.status = err.status || 500;
            ctx.body = err.message;
        }
    });

    // Mount routes
    app.use(router.routes(), router.allowedMethods());

    // Start the app
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
});
