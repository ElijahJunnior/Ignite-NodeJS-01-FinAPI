const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

const customers = [];

app.use(express.json());

// Middleware
function verifyIfExistsAccountCPF(req, res, nxt) { 

  const { cpf } = req.headers;
 
  const customer = customers.find(
    customer => customer.cpf === cpf
  );

  if(!customer) { 
    return res.status(400).json({error: 'Customer not found'});
  }

  req.customer = customer;

  nxt();

}

// aux functions 
function getBalance(statement) { 
  
  return statement.reduce((acc, cur) => { 
    if(cur.type === 'credit') { 
      acc += cur.amount;
    } else { 
      acc -= cur.amount;
    }
    return acc;
  }, 0);

}

// routes
app.post('/account', (req, res) => { 

  const { cpf, name } = req.body;

  const customersAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  )

  if(customersAlreadyExists) { 
    return res.status(400).json({ 
      error: 'Customers Already Exists'
    })
  }

  customers.push({ 
    id: uuidv4(), 
    cpf, 
    name, 
    statement: []
  })

  res.status(201).send();

});

app.post('/deposit', verifyIfExistsAccountCPF, (req, res) => { 
  
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = { 
    description, 
    amount, 
    created_at: new Date(), 
    type: 'credit'
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();

})

app.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => { 

  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);

  if(balance < amount) { 
    return res.status(400).json({error: "Insufficient funds!"});
  }

  const statementOperation = { 
    amount, 
    created_at: new Date(), 
    type: 'debit'
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();

})

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => { 

  const customer = req.customer;

  return res.json(customer.statement);

});

app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => { 

  const customer = req.customer;
  const { date } = req.query;

  const dateFormated = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) => (
      statement.created_at.toDateString() === new Date(dateFormated).toDateString()
    )
  )

  return res.json(statement);

});

app.listen(3333, () => { console.log('Server Started 🎉🎉🥳🥳'); });