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
    if (err) throw err
  })
}

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

const viewProducts = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM `products`', (err, res) => {
      if (err) {
        return reject(err)
      }
      return resolve(res)
    })
  })
}

const updateProducts = (total, answerId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      'UPDATE `products` SET stockQuantity = ? WHERE itemId = ?',
      [total, answerId.id],
      (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      }
    )
  })
}

const updatePrompts = () =>
  inquirer.prompt([
    {
      type: 'number',
      name: 'id',
      message: 'Please enter the ID number of the item you wish to update.',
      validate: value => !Number.isNaN(value)
    },
    {
      type: 'number',
      name: 'quantity',
      message: 'Please enter the quantity you would like to add into stock.',
      validate: value => !Number.isNaN(value)
    }
  ])

const addInventory = () => {
  viewProducts()
    .then(data => {
      console.table(data)
      updatePrompts().then(answer => {
        const total =
          data.filter(id => id.itemId === answer.id)[0].stockQuantity +
          answer.quantity
        updateProducts(total, answer).then(() => {
          viewProducts().then(data => {
            console.table(data.filter(id => id.itemId === answer.id))
            finished()
          })
        })
      })
    })
    .catch(console.error)
}

const newProductRow = (columns, data) => {
  return new Promise((resolve, reject) => {
    connection.query(
      'INSERT INTO `products` ? VALUES ?',
      [columns, data],
      (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      }
    )
  })
}

const newProductQuestions = () =>
  inquirer.prompt([
    {
      name: 'name',
      message: 'Please enter the name of the product you would like to add.'
      // validate:
    },
    {
      name: 'department',
      message: 'What department would the product be sold in?'
      // validate:
    },
    {
      name: 'price',
      message: 'What is the price of the product?',
      validate: value => !Number.isNaN(value)
    },
    {
      name: 'quantity',
      message: 'How many of them do we have in stock?',
      validate: value => !Number.isNaN(value)
    }
  ])

const newProduct = () => {
  const columns = ['productName', 'departmentName', 'price', 'stockQuantity']
  newProductQuestions().then(answers => {
    const data = [
      answers.name,
      answers.department,
      answers.price,
      answers.quantity
    ]
    newProductRow(columns, data).then(() => viewProducts())
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
            .then(data => {
              console.table(data)
              finished()
            })
            .catch(console.error)
          break
        case 'View low inventory':
          viewProducts()
            .then(data => {
              console.table(data.filter(quant => quant.stockQuantity < 5))
              finished()
            })
            .catch(console.error)
          break
        case 'Add to inventory':
          addInventory()
          break
        case 'Add new product':
          newProduct()
          break
      }
    })

question()
// finished()
