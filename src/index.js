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

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => { 

  const customer = req.customer;

  return res.json(customer.statement);

});

app.listen(3333, () => { console.log('Server Started 🎉🎉🥳🥳'); });