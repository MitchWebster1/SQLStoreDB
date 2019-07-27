const inquirer = require('inquirer')
const mysql = require('mysql')

const finished = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'finished',
        message: 'Would you like to make any other purchases?',
        choices: ['Yes', 'No']
      }
    ])
    .then(answers => {
      const expr = answers.finished
      switch (expr) {
        case 'Yes':
          transaction()
          break
        case 'No':
          connectionEnd()
          break
      }
    })
}

const questions = () => {
  inquirer
    .prompt([
      {
        name: 'id',
        message:
          'What is the itemId number of the Item you would like to purchase?',
        validate: value => !Number.isNaN(value)
      },
      {
        name: 'quantity',
        message: 'How many of that item would you like to purchase?',
        validate: value => !Number.isNaN(value)
      }
    ])
    .then(answers => customerOrder(answers.id, answers.quantity))
    .catch(console.error)
}

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bamazon'
})

const connectionEnd = () => {
  connection.end(err => {
    if (err) {
      console.log(err)
    }
  })
}

const showProducts = columns => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT ?? FROM `products`', [columns], (err, res) => {
      if (err) {
        return reject(err)
      }
      return resolve(console.table(res))
    })
  })
}

const dbUpdate = (newQuantity, id) => {
  return new Promise((resolve, reject) => {
    connection.query(
      'UPDATE `products` SET `stockQuantity` = ? WHERE `itemId` = ?',
      [newQuantity, id],
      (err, res) => {
        if (err) {
          return reject(err)
        }
        console.log('Database Updated!')
        return resolve(res)
      }
    )
  })
}

const customerOrder = (id, quantity) => {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT * FROM `products` WHERE `itemId` = ?',
      [id],
      (err, res) => {
        if (err) {
          return reject(err)
        }
        if (res[0].stockQuantity > quantity) {
          const newQuantity = res[0].stockQuantity - quantity
          console.log("You're order is processing!")
          dbUpdate(newQuantity, id).then(() => {
            console.log(`You're total is $${res[0].price * quantity}`, '\n')
            return resolve(res)
          })
        } else {
          console.log(
            `Sorry we only have ${res[0].stockQuantity} in stock`,
            '\n'
          )
          return resolve(res)
        }
      }
    )
  })
    .then(() => finished())
    .catch(console.error)
}

const transaction = () => {
  showProducts(['itemId', 'productName', 'price'])
    .then(() => questions())
    .catch(console.error)
}

transaction()
