import { Hono } from 'hono'
const auth = new Hono()

import { sign, verify } from 'hono/jwt'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
const expiresIn = 24 * 60 * 60
export const cookieName = 'user'

import db from './db.js'
import crypto from 'crypto'

auth.post('/login', async c => {
    const { username, password } = await c.req.json()
    if (typeof username !== 'string' || username === '' || typeof password !== 'string' || password === '') {
        return c.text('请求错误', 401)
    }

    const user = await db(c.env).query.users.findFirst({
        where: (users, { eq }) => eq(users.name, username)
    })

    if (typeof user === 'undefined') {
        return c.text('用户不存在', 404)
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex')
    if (hash !== user.auth) {
        return c.text('密码错误', 401)
    }

    const payload = await sign({ ...user, exp: Math.floor(Date.now() / 1000) + expiresIn }, c.env.jwt_secret, 'HS256')
    setCookie(c, cookieName, payload, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: expiresIn
    })

    return c.text('登录成功', 200)
})

export const needAuth = async (c, next) => {
    const payload = getCookie(c, cookieName)
    if (!payload) {
        return c.text('未授权', 401)
    }

    try {
        const user = await verify(payload, c.env.jwt_secret, 'HS256')
        c.set('user', user)
    } catch {
        deleteCookie(c, cookieName)
        return c.text('验证失败', 401)
    }

    return await next()
}

auth.get('/status', needAuth, c => {
    return c.text('验证成功', 200)
})

auth.get('/logout', needAuth, c => {
    deleteCookie(c, cookieName)
    return c.text('已登出', 200)
})

export default auth
