import { Hono } from 'hono'
const provider = new Hono()

import { needAuth } from './auth.js'
provider.use(needAuth)

import { providers } from './db.js'
import db from './db.js'
import { eq } from 'drizzle-orm'

provider.get('/list', async c => {
    const result = await db(c.env)
        .select({
            name: providers.name,
            url: providers.url
        })
        .from(providers)

    return c.json(result, 200)
})

provider.get('/info', async c => {
    if (c.get('user').role !== 'admin') {
        return c.text('无权限', 403)
    }

    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    const result = await db(c.env).query.providers.findFirst({
        where: (providers, { eq }) => eq(providers.name, name)
    })

    if (typeof result === 'undefined') {
        return c.text('供应不存在', 404)
    }

    return c.json(result, 200)
})

provider.delete('/delete', async c => {
    if (c.get('user').role !== 'admin') {
        return c.text('无权限', 403)
    }

    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    const info = await db(c.env).query.providers.findFirst({
        columns: { id: true },
        where: (providers, { eq }) => eq(providers.name, name)
    })

    if (typeof info === 'undefined') {
        return c.text('供应不存在', 404)
    }

    await db(c.env).delete(providers).where(eq(providers.id, info.id))
    return c.text('删除成功', 200)
})

provider.post('/save', async c => {
    if (c.get('user').role !== 'admin') {
        return c.text('无权限', 403)
    }

    const { id, name, url, key } = await c.req.json()
    if (typeof id !== 'string' || typeof name !== 'string' || name === '' || typeof url !== 'string' || url === '' || typeof key !== 'string' || key === '') {
        return c.text('请求错误', 400)
    }

    if (id === '') {
        await db(c.env).insert(providers).values({ name, url, key })
    } else {
        await db(c.env).update(providers).set({ name, url, key }).where(eq(providers.id, id))
    }

    return c.text('保存成功', 200)
})

export default provider
