require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors =  require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

morgan.token('body', (req, res) => {
  if (req.body && typeof req.body === 'object' && req.body.name && req.body.number) {
    const body = { name: req.body.name, number: req.body.number };
    return JSON.stringify(body);
  }
  return '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const ramdonId =()=> Math.floor(Math.random()*1000)

let persons = []

app.get("/api/persons",(req,res)=> {
  Person.find({}).then(person =>{
    res.json(person)
  })
})

app.get("/info",(req,res)=>{
  const numofcontact = persons.length
  const fechaReq = new Date()

  res.send(`<p>Phonebook has info for ${numofcontact} people</p>
    <p>${fechaReq} </p>`)
})

app.get("/api/persons/:id",(req,res)=>{
  Person.findById(req.params.id).then(person=>{
    res.json(person)
  })
})
app.post("/api/persons",(req,res)=>{
   const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'content missing' 
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savePerson => {
    res.json(savePerson)
  })
})

app.delete("/api/persons/:id",(req,res)=>{
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
}
);