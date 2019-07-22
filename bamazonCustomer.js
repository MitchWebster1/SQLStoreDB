const inquirer = require('inquirer')
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bamazon'
})

const dbConnect = columns => {
  connection.query(
    'SELECT ?? FROM `products`',
    [columns],
    (err, results, fields) => {
      if (err) {
        console.log(err)
      } else {
        console.table(results)
      }
    }
  )
}

const connectionEnd = () => {
  connection.end(err => {
    if (err) {
      console.log(err)
    }
  })
}

const dbUpdate = (newQuantity, id) => {
  connection.query(
    'UPDATE `products` SET `stockQuantity` = ? WHERE `itemId` = ?',
    [newQuantity, id],
    (err, results, fields) => {
      if (err) {
        console.log(err)
      } else {
        console.log('Database Updated!')
      }
    }
  )
  connectionEnd()
}

const customerOrder = (id, quantity) => {
  connection.query(
    'SELECT * FROM `products` WHERE `itemId` = ?',
    [id],
    (err, results, fields) => {
      if (err) {
        console.log(err)
      } else {
        if (results[0].stockQuantity > quantity) {
          const newQuantity = results[0].stockQuantity - quantity
          console.log("You're order is processing!")
          dbUpdate(newQuantity, id)
          console.log(`You're total is $${results[0].price * quantity}`)
        } else {
          console.log(`Sorry we only have ${results[0].stockQuantity} in stock`)
        }
      }
    }
  )
}

const questions = () => {
  dbConnect(['itemId', 'productName', 'price'])
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
}

questions()
