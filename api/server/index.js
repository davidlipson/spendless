const Koa = require('koa');
const cors = require('kcors');
const Router = require('koa-router');
const DBClient = require('./database');
const koaBody = require('koa-body');
const { whitelist, blacklist } = require('./lists');

console.log('Starting...');

const database = new DBClient();
database.createDatabase().then(() => {
    const router = new Router();
    const port = process.env.PORT || 5000;

    router.get('/user', async (ctx) => {
        const { uid } = ctx.request.body;
        const results = await database.getUser(uid);
        if (results.length === 0) {
            ctx.throw(404);
        }
        ctx.body = results;
    });

    router.get('/submit', async (ctx) => {});

    router.post('/page', koaBody(), async (ctx) => {
        const { uid, url, amount, description, lastPurchase } =
            ctx.request.body;
        if (lastPurchase) {
            await database.addLastTransaction(uid);
        }
        const results = await database.setPage(uid, url, amount, description);
        ctx.body = results;
    });

    router.post('/budget', koaBody(), async (ctx) => {
        const { uid, budget } = ctx.request.body;
        const results = await database.updateBudget(uid, budget);
        ctx.body = results;
    });

    router.get('/history', async (ctx) => {
        const { uid } = ctx.request.body;
        const results = await database.getHistory(uid);
        ctx.body = results;
    });

    router.get('/list', async (ctx) => {
        ctx.body = { whitelist, blacklist };
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
        const { email, first_name, last_name } = ctx.request.body;
        const results = await database.loginUser(email, first_name, last_name);
        if (results.length === 0) {
            ctx.throw(404);
        }
        ctx.body = results;
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
