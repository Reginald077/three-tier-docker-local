let con;

function init(connection) {
  con = connection;
}

function addTransaction(amount, desc) {
  var sql = `INSERT INTO \`transactions\` (\`amount\`, \`description\`) VALUES ('${amount}','${desc}')`;
  con.query(sql, function(err, result) {
    if (err) throw err;
    console.log("Adding to the table should have worked");
  });
  return 200;
}

function getAllTransactions(callback) {
  var sql = "SELECT * FROM transactions";
  con.query(sql, function(err, result) {
    if (err) throw err;
    console.log("Getting all transactions...");
    return callback(result);
  });
}

function findTransactionById(id, callback) {
  var sql = `SELECT * FROM transactions WHERE id = ${id}`;
  con.query(sql, function(err, result) {
    if (err) throw err;
    console.log(`retrieving transactions with id ${id}`);
    return callback(result);
  });
}

function deleteAllTransactions(callback) {
  var sql = "DELETE FROM transactions";
  con.query(sql, function(err, result) {
    if (err) throw err;
    console.log("Deleting all transactions...");
    return callback(result);
  });
}

function deleteTransactionById(id, callback) {
  var sql = `DELETE FROM transactions WHERE id = ${id}`;
  con.query(sql, function(err, result) {
    if (err) throw err;
    console.log(`Deleting transactions with id ${id}`);
    return callback(result);
  });
}

module.exports = { init, addTransaction, getAllTransactions, deleteAllTransactions, findTransactionById, deleteTransactionById };
