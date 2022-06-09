const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const customers = [];

app.use(express.json());

app.post('/account', (req, res, nxt) => { 

  const { cpf, name } = req.body;

  const customersAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  )

  if(customersAlreadyExists) { 
    return res.status(400).send({ 
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

app.listen(3333, () => { console.log('Server Started 🎉🎉🥳🥳'); });