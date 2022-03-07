const postgres = require('pg')

// Initialize postgres client
const client = new postgres.Client({
	user: "postgres",
	password: "",
	database: "postgres",
	port: 5436,
	host: "localhost",
	ssl: false
})

// Connect to the DB
client.connect().then(() => {
	console.log(`Connected To ${client.database} at ${client.host}:${client.port}`)
}).catch((e) => {console.log(e)})

module.exports = {
    getUser: async (uid) => {
        const query = `select * from public.user where id = '${uid}' limit 1`;
        const results = await client.query(query)
        return results.rows
    },
	getHistory: async (uid) => {
        const query = `select * from public.transaction where uid = '${uid}'::uuid::uuid and ignored is false order by timestamp desc`;
		console.log(query)
        const results = await client.query(query)
        return results.rows
    },
	ignoreTransaction: async (uid, id) => {
		const query = `update public.transaction set ignored = true where uid='${uid}'::uuid::uuid and id='${id}'::uuid::uuid`;
		console.log(query)
        const results = await client.query(query)
        return results
    },
    loginUser: async (gid, first_name, last_name, email) => {
        const query = `
            with s as (
                select *
                from public.user
                where gid = '${gid}'
            ), i as (
                insert into public.user ("gid", "first_name", "last_name", "email")
                select '${gid}', '${first_name}', '${last_name}', '${email}'
                where not exists (select 1 from s)
                returning *
            )
            select *
            from i
            union all
            select * 
            from s
        `;

		console.log(query)
        const results = await client.query(query)
        return results.rows
    }
}
