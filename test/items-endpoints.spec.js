const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('items Endpoints', function() {
  let db

  const {
    testUsers,
    testitems,
  } = helpers.makeitemsFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  describe(`GET /api/items`, () => {
    context(`Given no items`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/items')
          .expect(200, [])
      })
    })

    context('Given there are items in the database', () => {
      beforeEach('insert items', () =>
        helpers.seeditemsTables(
          db,
          testUsers,
          testitems,
        )
      )

      it('responds with 200 and all of the items', () => {
        const expecteditems = testitems.map(workout =>
          helpers.makeExpectedWorkout(
            testUsers,
            workout,
          )
        )
        return supertest(app)
          .get('/api/items')
          .expect(200, expecteditems)
      })
    })
  })



    context('Given there are items in the database', () => {
      beforeEach('insert items', () =>
        helpers.seeditemsTables(
          db,
          testUsers,
          testitems,
        )
      )
    })

  
  })

