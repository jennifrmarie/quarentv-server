const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password',
      date: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password',
      date: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      user_name: 'test-user-3',
      password: 'password',
      date: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      user_name: 'test-user-4',
      password: 'password',
      date: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeworkoutsArray(users) {
  return [
    {
      id: 1,
      title: 'First test post!',
      style: 'How-to',
      author_id: users[0].id,
      date: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 2,
      title: 'Second test post!',
      style: 'Interview',
      author_id: users[1].id,
      date: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 3,
      title: 'Third test post!',
      style: 'News',
      author_id: users[2].id,
      date: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 4,
      title: 'Fourth test post!',
      style: 'Listicle',
      author_id: users[3].id,
      date: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
  ]
}

function makeExpectedWorkout(users, workout) {
  const author = users
    .find(user => user.id === workout.author_id)


  return {
    id: workout.id,
    reps: workout.reps,
    sets: workout.sets,
    weight: workout.weight,
    date: workout.date.toISOString(),
    author: {
      id: author.id,
      user_name: author.user_name,
      date: author.date.toISOString(),
      date_modified: author.date_modified || null,
    },
  }
}


function makeMaliciousWorkout(user) {
  const maliciousWorkout = {
    id: 911,
    reps: 'How-to',
    sets: 3,
    weight: 124,
    date: new Date(),
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    author_id: user.id,
    // content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedWorkout = {
    ...makeExpectedWorkout([user], maliciousWorkout),
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    name: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousWorkout,
    expectedWorkout,
  }
}

function makeworkoutsFixtures() {
  const testUsers = makeUsersArray()
  const testworkouts = makeworkoutsArray(testUsers)
  return { testUsers, testworkouts }
}


function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('reppy_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('reppy_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedworkoutsTables(db, users, workouts) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('reppy_workouts').insert(workouts)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('reppy_workouts_id_seq', ?)`,
      [workouts[workouts.length - 1].id],
    )
  })
}

function seedMaliciousWorkout(db, user, workout) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('reppy_workouts')
        .insert([workout])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeworkoutsArray,
  makeExpectedWorkout,
  makeMaliciousWorkout,

  makeworkoutsFixtures,
  seedworkoutsTables,
  seedMaliciousWorkout,
  makeAuthHeader,
  seedUsers,
}
