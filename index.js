require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors =  require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}


morgan.token('body', (req, res) => {
  if (req.body && typeof req.body === 'object' && req.body.name && req.body.number) {
    const body = { name: req.body.name, number: req.body.number };
    return JSON.stringify(body);
  }
  return '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


const ramdonId =()=> Math.floor(Math.random()*1000)

app.get("/api/persons",(req,res)=> {
  Person.find({}).then(person =>{
    res.json(person)
  })
})

app.get("/info",(req,res)=>{
Person.countDocuments({}).then(count=>{
  const fechaReq = new Date
    res.send(`<p>Phonebook has info for ${count} people</p>
    <p>${fechaReq} </p>`)
}).catch(error=>{   
    console.error('Error al contar documentos:', error)
    res.status(500).json({ error: 'Error al contar las personas'})
  })

})

app.get("/api/persons/:id",(req,res,next)=>{
  Person.findById(req.params.id).then(person=>{
    if(person){
          res.json(person)
    }else{
      res.status(404).end()
    }

  })
  .catch(error=> next(error))
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

app.put('/api/persons/:id',(req,res,next)=>{
  const body = req.body

  const person = {
    name:body.name,
    number:body.number,
  }
  Person.findByIdAndUpdate(req.params.id,person,{new:true})
  .then(updatePerson =>{
    res.json(updatePerson)
  })
  .catch(error => next(error))
})

app.delete("/api/persons/:id",(req,res, next)=>{
  Person.findByIdAndDelete(req.params.id).then(result=>{
    res.status(204).end()
  })
  .catch(error=> next(error))
})



app.use(errorHandler)


const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})