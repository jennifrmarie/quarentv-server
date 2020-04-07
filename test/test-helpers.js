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

function makeitemsArray(users) {
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

function makeExpectedWorkout(users, item) {
  const author = users
    .find(user => user.id === item.author_id)


  return {
    id: item.id,
    reps: item.reps,
    sets: item.sets,
    weight: item.weight,
    date: item.date.toISOString(),
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

function makeitemsFixtures() {
  const testUsers = makeUsersArray()
  const testitems = makeitemsArray(testUsers)
  return { testUsers, testitems }
}


function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('quarentv_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('quarentv_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seeditemsTables(db, users, items) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('watch_items').insert(items)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('watch_items_id_seq', ?)`,
      [items[items.length - 1].id],
    )
  })
}

function seedMaliciousWorkout(db, user, item) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('watch_items')
        .insert([item])
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
  makeitemsArray,
  makeExpectedWorkout,
  makeMaliciousWorkout,

  makeitemsFixtures,
  seeditemsTables,
  seedMaliciousWorkout,
  makeAuthHeader,
  seedUsers,
}
