const xss = require('xss')

const ItemsService = {
  getAllItems(db, userId) {
    return db
      .from('watch_items AS item')
      .select(
        'item.id',
        'item.title',
        'item.strmservice',
        'item.date',
      )
      .where({
        user_id: userId
      })
  },

  insertItem(db, newItem) {
    return db
      .insert(newItem)
      .into('watch_items')
      .returning('*')
      .then(([item]) => item)
      .then(item =>
        ItemsService.getById(db, item.id)
      )
  },

  validateName(title) {
    if (title.length === 0) {
      return 'title is required'
    }
  },



  updateItem(db, id, item) {
    sql = db("watch_items")
      .where({id:id})
      .update(item)
      return sql;
  },

  deleteItem(db, id, item) {
    sql = db("watch_items")
      .where({ id:id })
      .delete(item)
      return sql;
  },

  getById(db, id) {
    return db
      .from('watch_items AS item')
      .select(
        'item.id',
        'item.title',
        'item.strmservice',
        'item.date',
      )
      .where('item.id', id)
      .first()
  },

  serializeItem(items) {
    const { item } = items
    return {
      id: items.id,
      strmservice: items.strmservice,
      title: xss(items.title),
      date: new Date(items.date),
    }
  },

}

module.exports = ItemsService
