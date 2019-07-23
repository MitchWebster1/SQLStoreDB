const inquirer = require('inquirer')
const mysql = require('mysql')

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

const viewProducts = () => {
  connection.query('SELECT * FROM `products`', (err, results, fields) => {
    if (err) {
      console.log(err)
    } else {
      console.table(results)
    }
    // connectionEnd()
  })
}

const lowInventory = () => {
  connection.query('SELECT * FROM `products`', (err, results, fields) => {
    if (err) {
      console.log(err)
    } else {
      const inv = results.filter(quant => quant.stockQuantity < 5)
      console.table(inv)
    }
    // connectionEnd()
  })
}

const question = () =>
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'products',
        message: 'What would you like to do?',
        choices: [
          'View products for sale',
          'View low inventory',
          'Add to inventory',
          'Add new product'
        ]
      }
    ])
    .then(answers => {
      const expr = answers.products
      switch (expr) {
        case 'View products for sale':
          viewProducts()
          finished()
          break
        case 'View low inventory':
          lowInventory()
          finished()
          break
        case 'Add to inventory':
          console.log('3')
          break
        case 'Add new product':
          console.log('4')
          break
      }
    })

const finished = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'finished',
        message: 'Would you like to make any other changes?',
        choices: ['Yes', 'No']
      }
    ])
    .then(answers => {
      const expr = answers.finished
      switch (expr) {
        case 'Yes':
          question()
          break
        case 'No':
          connectionEnd()
          break
      }
    })
}

question()
// finished()
