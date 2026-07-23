import { Hono } from 'hono'
const app = new Hono()

import api from './api.js'
app.route('/api', api)

app.get('*', async c => {
    const res = await c.env.assets.fetch(c.req.raw)
    if (res.status === 404) {
        return c.env.assets.fetch(new Request(new URL('/index.html', c.req.url), c.req))
    }

    return res
})

export default app
