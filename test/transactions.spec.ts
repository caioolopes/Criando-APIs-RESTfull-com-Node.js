import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transactions', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  it('should be able to list all transactions from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Lunch',
        description: "It's a lunch",
        isOnDiet: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day after
      })
      .expect(201)

    const transactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    expect(transactionsResponse.body.transactions).toHaveLength(2)

    expect(transactionsResponse.body.transactions[0].name).toBe('Lunch')
    expect(transactionsResponse.body.transactions[1].name).toBe('Breakfast')
  })

  it('should be able to show a single transactions', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const transactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    const transactionsId = transactionsResponse.body.transactions[0].id

    const singleTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionsId}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    // CORREÇÃO: Espera a chave 'meal' e o tipo 'Number' (timestamp) para a data.
    expect(singleTransactionResponse.body).toEqual({
      meal: expect.objectContaining({
        name: 'Breakfast',
        description: "It's a breakfast",
        is_on_diet: 1,
        date: expect.any(Number),
      }),
    })
  })

  it('should be able to update a transactions from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const transactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    const transactionsId = transactionsResponse.body.transactions[0].id

    await request(app.server)
      .put(`/transactions/${transactionsId}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Dinner',
        description: "It's a dinner",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(204)
  })

  it('should be able to delete a transactions from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const transactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    const transactionsId = transactionsResponse.body.transactions[0].id

    await request(app.server)
      .delete(`/transactions/${transactionsId}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(204)
  })

  it('should be able to get metrics from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isOnDiet: true,
        date: new Date('2021-01-01T08:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Lunch',
        description: "It's a lunch",
        isOnDiet: false,
        date: new Date('2021-01-01T12:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Snack',
        description: "It's a snack",
        isOnDiet: true,
        date: new Date('2021-01-01T15:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Dinner',
        description: "It's a dinner",
        isOnDiet: true,
        date: new Date('2021-01-01T20:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/transactions')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        isOnDiet: true,
        date: new Date('2021-01-02T08:00:00'),
      })
      .expect(201)

    const metricsResponse = await request(app.server)
      .get('/transactions/metrics')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totaltransactions: 5,
      totaltransactionsOnDiet: 4,
      totaltransactionsOffDiet: 1,
      bestOnDietSequence: 3,
    })
  })
})