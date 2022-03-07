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
	const results = await database.loginUser(body.gid, body.first_name, body.last_name, body.email)
	if (results.length === 0) { ctx.throw(404) }
  	ctx.body = results
})

module.exports = router

