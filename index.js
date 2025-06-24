const express = require('express');
const morgan = require('morgan');
const cors =  require('cors')
const app = express();
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

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get("/api/persons",(req,res)=> {
  res.json(persons);
})

app.get("/info",(req,res)=>{
  const numofcontact = persons.length
  const fechaReq = new Date()

  res.send(`<p>Phonebook has info for ${numofcontact} people</p>
    <p>${fechaReq} </p>`)
})

app.get("/api/persons/:id",(req,res)=>{
  const id= Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person){
    res.json(person)
  }else{
    res.status(404).end()
  }
})
app.post("/api/persons",(req,res)=>{
  const person = req.body
  const readyExist = persons.find(person1 => person1.name === person.name)

  person.id = ramdonId()
  if(!person.name){
    return res.status(400).json({error:'Missing name'})
  }else if (!person.number){
    return res.status(400).json({error:'Missing number'})
  }else if (readyExist){
    return res.status(400).json({error:'Person already exist on Phonebook'})
  }else{
      persons = persons.concat(person)
      return res.json(person)
  }

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