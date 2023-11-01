"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const kcors_1 = __importDefault(require("kcors"));
const koa_router_1 = __importDefault(require("koa-router"));
const database_1 = require("./database");
const koa_body_1 = __importDefault(require("koa-body"));
const lists_1 = require("./lists");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const { whitelist, blacklist, totalRegex, processButtonEndWords, processButtons, } = lists_1.lists;
const database = new database_1.DBClient();
database.createDatabase(process.env.RESTART === '1').then(() => {
    const router = new koa_router_1.default();
    const port = process.env.PORT || 5000;
    router.get('/user', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { uid } = ctx.query;
            const results = yield database.getUser(uid);
            if (results.length === 0) {
                ctx.throw(404);
            }
            ctx.body = results;
        }
        catch (err) {
            console.log(err);
        }
    }));
    router.post('/onboard', (0, koa_body_1.default)(), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { uid } = ctx.request.body;
            const results = yield database.onboardUser(uid);
            if (results.length === 0) {
                ctx.throw(404);
            }
            ctx.body = results;
        }
        catch (err) {
            console.log(err);
        }
    }));
    router.post('/add', (0, koa_body_1.default)(), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { uid, amount, description, tid } = ctx.request.body;
            let newId = null;
            if (amount > 0) {
                newId = yield database.addTransaction(tid, uid, description, amount);
            }
            const results = yield database.getUser(uid);
            ctx.body = { total: results[0].spent, tid: newId };
        }
        catch (err) {
            console.log(err);
        }
    }));
    router.post('/process', (0, koa_body_1.default)(), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { uid, tid } = ctx.request.body;
            if (uid && tid) {
                yield database.confirmLastTransaction(uid, tid);
            }
            const results = yield database.getUser(uid);
            ctx.body = { total: results[0].spent };
        }
        catch (err) {
            console.log(err);
        }
    }));
    router.post('/budget', (0, koa_body_1.default)(), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { uid, budget } = ctx.request.body;
        const results = yield database.updateBudget(uid, budget);
        ctx.body = results;
    }));
    router.get('/history', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const uid = ctx.query.uid;
        const { history, spent, recent } = yield database.getHistory(uid);
        ctx.body = { history, spent, recent };
    }));
    router.get('/recent', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const uid = ctx.query.uid;
        const recent = yield database.getRecentlyUnconfirmed(uid);
        ctx.body = recent;
    }));
    router.get('/list', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        ctx.body = {
            whitelist,
            blacklist,
            totalRegex,
            processButtons,
            processButtonEndWords,
        };
    }));
    router.post('/ignore', (0, koa_body_1.default)(), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { uid, id } = ctx.request.body;
        const results = yield database.ignoreTransaction(uid, id);
        if (results.rowCount === 0) {
            ctx.throw(404);
        }
        ctx.body = results;
    }));
    router.post('/login', (0, koa_body_1.default)(), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, first_name, last_name } = ctx.request
                .body;
            if ((email === null || email === void 0 ? void 0 : email.length) > 0) {
                const results = yield database.loginUser(email, first_name, last_name);
                if (results.length === 0) {
                    ctx.throw(404);
                }
                ctx.body = results;
            }
            else {
                throw 'Invalid email.';
            }
        }
        catch (e) {
            console.log(e);
        }
    }));
    const app = new koa_1.default();
    var options = {
        origin: '*',
    };
    app.use((0, kcors_1.default)(options));
    app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield next();
        }
        catch (err) {
            ctx.status = err.status || 500;
            ctx.body = err.message;
        }
    }));
    app.use(router.routes());
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
});
//# sourceMappingURL=index.js.map