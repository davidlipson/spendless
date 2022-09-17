const Koa = require('koa');
const cors = require('kcors');
const Router = require('koa-router');
const DBClient = require('./database');
const koaBody = require('koa-body');

console.log('Starting...');

const database = new DBClient();
database.createDatabase().then(() => {
    const router = new Router();
    const port = process.env.PORT || 5000;

    router.get('/user', async (ctx) => {
        const results = await database.getUser(ctx.query.uid);
        if (results.length === 0) {
            ctx.throw(404);
        }
        ctx.body = results;
    });

    router.get('/submit', async (ctx) => {
        const results = await database.addLastTransaction(ctx.query.uid);
        ctx.body = results;
    });

    router.post('/page', koaBody(), async (ctx) => {
        const results = await database.setPage(
            ctx.request.body.uid,
            ctx.request.body.url,
            ctx.request.body.amount,
            ctx.request.body.description
        );
        ctx.body = results;
    });

    router.post('/budget', koaBody(), async (ctx) => {
        const results = await database.updateBudget(
            ctx.request.body.uid,
            ctx.request.body.budget
        );
        ctx.body = results;
    });

    router.get('/history', async (ctx) => {
        const results = await database.getHistory(ctx.query.uid);
        ctx.body = results;
    });

    router.get('/list', async (ctx) => {
        const whitelist = {
            processed: {
                query: '',
                regex: ['/gp/buy/thankyou'],
            },
            checkout: {
                query: '.grand-total-price, .payment-due__price, .a-price-whole',
                description: '#productTitle, #title',
                regex: [
                    'amazon.+/gp/buy/',
                    '/checkouts',
                    '/checkout',
                    '/gp',
                    '/dp',
                    '/buy/',
                ],
            },
            cart: {
                query: '#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole, .price, .gl-body-l',
                regex: ['amazon.+/gp/cart', 'amazon.+/cart', '/cart', '/dp'],
            },
        };
        const blacklist = ['amazon.+/dp/', 'amazon.+/gp/product/'];
        console.log(whitelist, blacklist);
        ctx.body = { whitelist, blacklist };
    });

    router.post('/ignore', koaBody(), async (ctx) => {
        const body = ctx.request.body;
        const results = await database.ignoreTransaction(body.uid, body.id);
        if (results.length === 0) {
            ctx.throw(404);
        }
        ctx.body = results;
    });

    router.post('/login', koaBody(), async (ctx) => {
        const body = ctx.request.body;
        const results = await database.loginUser(
            body.email,
            body.first_name,
            body.last_name
        );
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
