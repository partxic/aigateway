import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import crypto from 'crypto'

export const users = sqliteTable('users', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    name: text('name').notNull().unique(),
    auth: text('auth').notNull(), // SHA256
    role: text('role').notNull().default('user') // admin | user
})

export const providers = sqliteTable('providers', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),

    name: text('name').notNull().unique(),
    url: text('url').notNull(),
    key: text('key').notNull()
})

import { drizzle } from 'drizzle-orm/d1'
export default env => drizzle(env.db, { schema: { users, providers } })
