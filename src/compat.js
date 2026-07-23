import { Hono } from 'hono'
const compat = new Hono()

import { cors } from 'hono/cors'
compat.use('*', cors())

import { providers } from './db.js'
import db from './db.js'

import pLimit from 'p-limit'

compat.use(async (c, next) => {
    const authorization = c.req.header('Authorization')
    if (!authorization) {
        return c.text('未授权', 401)
    }

    const parts = authorization.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return c.text('验证失败', 401)
    }

    const token = parts[1]
    const idx = token.indexOf('.')
    const userId = token.substring(0, idx)
    const userAuth = token.substring(idx + 1)

    const user = await db(c.env).query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId)
    })

    if (typeof user === 'undefined') {
        return c.text('用户不存在', 404)
    }

    if (userAuth !== user.auth) {
        return c.text('验证失败', 401)
    }

    c.set('user', user)
    return await next()
})

compat.use(async (c, next) => {
    const result = await db(c.env)
        .select({
            name: providers.name,
            url: providers.url,
            key: providers.key
        })
        .from(providers)

    c.set('providers', result)
    return await next()
})

compat.get('/models', async c => {
    const user = c.get('user')
    console.log(`${user.id}(${user.name}) -> /models`)

    const limit = pLimit(6)
    const time = Math.floor(Date.now() / 1000)

    const tasks = c.get('providers').map(provider => {
        return limit(async () => {
            const resp = await fetch(`${provider.url}/models`, {
                headers: { Authorization: `Bearer ${provider.key}` }
            })

            const data = (await resp.json()).data
            return data.map(item => ({
                id: `${provider.name}/${item.id}`,
                object: 'model',
                created: time,
                owned_by: provider.name
            }))
        })
    })

    const result = {
        object: 'list',
        data: (await Promise.all(tasks)).flat()
    }

    return c.json(result, 200)
})

compat.post('/:path{.*}', async c => {
    const { path } = c.req.param()
    const body = await c.req.json()
    const { model } = body

    const idx = model.indexOf('/')
    const providerName = model.substring(0, idx)
    body.model = model.substring(idx + 1)

    const provider = c.get('providers').find(provider => provider.name === providerName)
    if (!provider) {
        return c.text('供应不存在', 404)
    }

    const user = c.get('user')
    console.log(`${user.id}(${user.name}) -> {${provider.name}}/${path} : ${body.model}`)

    const reqHeaders = new Headers()
    reqHeaders.set('Authorization', `Bearer ${provider.key}`)
    reqHeaders.set('Content-Type', c.req.header('Content-Type'))

    return fetch(`${provider.url}/${path}`, {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(body),
        cf: {
            cacheTtl: 0,
            cacheEverything: false
        }
    })
})

export default compat
