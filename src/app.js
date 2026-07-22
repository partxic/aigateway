import { Hono } from 'hono'
const app = new Hono()

import api from './api.js'
app.route('/api', api)

export default app
