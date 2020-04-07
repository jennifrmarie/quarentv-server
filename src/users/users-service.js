const bcrypt = require('bcryptjs')
const xss = require('xss')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
  hasUserWithUserName(db, user_name) {
    return db('quarentv_users')
      .where({ user_name })
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('quarentv_users')
      .returning('*')
      .then(([user]) => user)
  },
  getById(db, userId) {
    return db
     .from('quarentv_users')
     .select('score')
     .where({id: userId})
     .first()
  },
  
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character'
    }
    return null
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  serializeUser(user) {
    return {
      id: user.id,
      user_name: xss(user.user_name),
      date: new Date(user.date),
      score: user.score,
      badge: user.badge,
    }
  },

  updateScore(db, userId, score) {
    return db('quarentv_users')
      .update({score})
      .where({id: userId})
      
  }
}

module.exports = UsersService
