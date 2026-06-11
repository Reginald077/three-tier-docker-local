const transactionService = require('./TransactionService');
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PWD);
console.log('DB_DATABASE:', process.env.DB_DATABASE);

function connectWithRetry() {
  const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_DATABASE
  });

  db.connect((err) => {
    if (err) {
      console.error('DB connection failed, retrying in 5 seconds...', err.message);
      setTimeout(connectWithRetry, 5000);
      return;
    }
    console.log('Connected to the MySQL database.');
    transactionService.init(db);
    createTables(db);
  });
}

function createTables(db) {
  const sql = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INT NOT NULL AUTO_INCREMENT,
      amount DECIMAL(10,2),
      description VARCHAR(100),
      PRIMARY KEY(id)
    );
  `;
  db.query(sql, (err) => {
    if (err) { console.error('Error creating table:', err); return; }
    console.log('Table "transactions" created or already exists.');
  });
}

connectWithRetry();

app.get('/health', (req, res) => {
  res.json("This is the health check");
});

app.post('/transaction', (req, res) => {
  try {
    transactionService.addTransaction(req.body.amount, req.body.desc);
    res.json({ message: 'added transaction successfully' });
  } catch (err) {
    res.json({ message: 'something went wrong', error: err.message });
  }
});

app.get('/transaction', (req, res) => {
  try {
    transactionService.getAllTransactions(function(results) {
      var transactionList = results.map(row => ({
        id: row.id, amount: row.amount, description: row.description
      }));
      res.status(200).json({ result: transactionList });
    });
  } catch (err) {
    res.json({ message: "could not get all transactions", error: err.message });
  }
});

app.delete('/transaction', (req, res) => {
  try {
    transactionService.deleteAllTransactions(function() {
      res.status(200).json({ message: "delete function execution finished." });
    });
  } catch (err) {
    res.json({ message: "Deleting all transactions may have failed.", error: err.message });
  }
});

app.delete('/transaction/id', (req, res) => {
  try {
    transactionService.deleteTransactionById(req.body.id, function() {
      res.status(200).json({ message: `transaction with id ${req.body.id} seemingly deleted` });
    });
  } catch (err) {
    res.json({ message: "error deleting transaction", error: err.message });
  }
});

app.get('/transaction/id', (req, res) => {
  try {
    transactionService.findTransactionById(req.body.id, function(result) {
      res.status(200).json({ id: result[0].id, amount: result[0].amount, desc: result[0].description });
    });
  } catch (err) {
    res.json({ message: "error retrieving transaction", error: err.message });
  }
});

app.listen(port, () => {
  console.log(`AB3 backend app listening at http://localhost:${port}`);
});
