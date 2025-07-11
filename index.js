require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors =  require('cors');
const Person = require('./models/person');
const app = express();

app.use(express.static('dist'));
app.use(cors());
app.use(express.json());


const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message });
  }

  next(error);
};


morgan.token('body', (req) => {
  if (req.body && typeof req.body === 'object' && req.body.name && req.body.number) {
    const body = { name: req.body.name, number: req.body.number };
    return JSON.stringify(body);
  }
  return '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));



app.get('/api/persons',(req,res) => {
  Person.find({}).then(person => {
    res.json(person);
  });
});

app.get('/info',(req,res) => {
  Person.countDocuments({}).then(count => {
    const fechaReq = new Date;
    res.send(`<p>Phonebook has info for ${count} people</p>
    <p>${fechaReq} </p>`);
  }).catch(error => {
    console.error('Error al contar documentos:', error);
    res.status(500).json({ error: 'Error al contar las personas' });
  });

});

app.get('/api/persons/:id',(req,res,next) => {
  Person.findById(req.params.id).then(person => {
    if(person){
      res.json(person);
    }else{
      res.status(404).end();
    }

  })
    .catch(error => next(error));
});

app.post('/api/persons',(req,res,next) => {
  const body = req.body;



  const person = new Person({
    name: body.name,
    number: body.number
  });

  person.save().then(savePerson => {
    res.json(savePerson);
  }).catch(error => next(error));
});

app.put('/api/persons/:id',(req,res,next) => {
  const { name,number } = req.body;
  Person.findByIdAndUpdate(req.params.id,
    { name, number },
    { new:true,runValidators:true,context:'query' })
    .then(updatePerson => {
      res.json(updatePerson);
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id',(req,res, next) => {
  Person.findByIdAndDelete(req.params.id).then(() => {
    res.status(204).end();
  })
    .catch(error => next(error));
});



app.use(errorHandler);


const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});