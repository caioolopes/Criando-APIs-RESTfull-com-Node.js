// src/app.ts

import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie';
import { usersRoutes } from './routes/users.routes' 
import { transactionsRoutes } from './routes/transactions.routes' 

export const app = fastify()

app.register(fastifyCookie)
app.register(usersRoutes, {
  prefix: '/users',
})

app.register(transactionsRoutes, { 
  prefix: '/transactions', 
})