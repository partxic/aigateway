import { Hono } from 'hono'
const account = new Hono()

import { deleteCookie } from 'hono/cookie'
import { cookieName, needAuth } from './auth.js'
account.use(needAuth)

import { users } from './db.js'
import db from './db.js'
import { eq } from 'drizzle-orm'

import crypto from 'crypto'

account.post('/reset-password', async c => {
    const { password } = await c.req.json()
    if (typeof password !== 'string' || password === '') {
        return c.text('请求错误', 400)
    }

    const auth = crypto.createHash('sha256').update(password).digest('hex')
    await db(c.env)
        .update(users)
        .set({ auth })
        .where(eq(users.id, c.get('user').id))

    deleteCookie(c, cookieName)
    return c.text('操作成功', 200)
})

account.get('/api-key', c => {
    const user = c.get('user')
    return c.text(user.id + '.' + user.auth, 200)
})

export default account
