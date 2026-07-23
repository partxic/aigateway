import { Hono } from 'hono'
const user = new Hono()

import { needAuth } from './auth.js'
user.use(needAuth)

import { users } from './db.js'
import db from './db.js'
import { eq } from 'drizzle-orm'

import crypto from 'crypto'

user.use(async (c, next) => {
    if (c.get('user').role !== 'admin') {
        return c.text('无权限', 403)
    }

    return await next()
})

user.get('/list', async c => {
    const result = await db(c.env)
        .select({
            name: users.name,
            role: users.role
        })
        .from(users)

    return c.json(result, 200)
})

user.get('/info', async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    const result = await db(c.env).query.users.findFirst({
        columns: { id: true, name: true, role: true },
        where: (users, { eq }) => eq(users.name, name)
    })

    if (typeof result === 'undefined') {
        return c.text('用户不存在', 404)
    }

    return c.json(result, 200)
})

user.delete('/delete', async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    const info = await db(c.env).query.users.findFirst({
        columns: { id: true },
        where: (users, { eq }) => eq(users.name, name)
    })

    if (typeof info === 'undefined') {
        return c.text('用户不存在', 404)
    }

    if (info.id === c.get('user').id) {
        return c.text('请求错误', 400)
    }

    await db(c.env).delete(users).where(eq(users.id, info.id))
    return c.text('删除成功', 200)
})

user.post('/save', async c => {
    const { id, name, password, role } = await c.req.json()
    if (typeof id !== 'string' || typeof name !== 'string' || name === '' || typeof password !== 'string' || typeof role !== 'string' || role === '' || id === c.get('user').id) {
        return c.text('请求错误', 400)
    }

    if (id === '') {
        if (password === '') {
            return c.text('请求错误', 400)
        }

        const auth = crypto.createHash('sha256').update(password).digest('hex')
        await db(c.env).insert(users).values({ name, auth, role })
    } else {
        const auth = password === '' ? undefined : crypto.createHash('sha256').update(password).digest('hex')
        await db(c.env).update(users).set({ name, auth, role }).where(eq(users.id, id))
    }

    return c.text('保存成功', 200)
})

export default user
