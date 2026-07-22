import { Hono } from 'hono'
const api = new Hono()

api.use(async (c, next) => {
    let realhost = c.req.header('x-forwarded-host')
    if (typeof realhost !== 'string') realhost = c.req.header('host')
    else realhost = realhost.split(',')[0].trim()
    c.set('realhost', realhost)
    await next()
})

api.get('/ping', c => {
    console.log('worker env will be here:', c.env)
    return c.text('pong', 200)
})

export default api
