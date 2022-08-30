const Router = require('koa-router')
const database = require('./database')
const joi = require('joi')
const validate = require('koa-joi-validate')
const koaBody = require('koa-body');

const router = new Router()

router.get('/user', async ctx => {
	const results = await database.getUser(ctx.query.uid)
	if (results.length === 0) { ctx.throw(404) }
  	ctx.body = results
})

router.get('/submit', async ctx => {
	const results = await database.addLastTransaction(ctx.query.uid)
  	ctx.body = results
})

router.post('/page',koaBody(), async ctx => {
	console.log(ctx.request.body)
	const results = await database.setPage(ctx.request.body.uid, ctx.request.body.url, ctx.request.body.amount, ctx.request.body.description)
  	ctx.body = results
})

router.post('/budget',koaBody(), async ctx => {
	const results = await database.updateBudget(ctx.request.body.uid, ctx.request.body.budget)
  	ctx.body = results
})

router.get('/history', async ctx => {
	const results = await database.getHistory(ctx.query.uid)
	if (results.length === 0) { ctx.throw(404) }
  	ctx.body = results
})

router.post('/ignore', koaBody(), async ctx => {
	const body = ctx.request.body;
	const results = await database.ignoreTransaction(body.uid, body.id)
	if (results.length === 0) { ctx.throw(404) }
  	ctx.body = results
})

router.post('/login', koaBody(), async ctx => {
	const body = ctx.request.body;
	const results = await database.loginUser(body.email, body.first_name, body.last_name)
	if (results.length === 0) { ctx.throw(404) }
  	ctx.body = results
})

module.exports = router

