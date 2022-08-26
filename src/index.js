const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(express.json())

const costumers = []

function verifyIfExistsAccountCPF (req, res, next) {
    const { cpf } = req.params

    const costumer = costumers.find(costumer => costumer.cpf === cpf)
    
    if(!costumer){
        return res.status(400).json({ ok: false})
    }

    req.costumer = costumer

    next()
}

app.post('/sign-up', (req, res) => {
    const { name, cpf } = req.body

    // Some retorna true ou false
    const cpfAlreadyExists = costumers.some(costumer => costumer.cpf === cpf)

    if(cpfAlreadyExists){
        return res.status(400).json({ ok: false })
    }

    costumers.push({
        id: uuidv4(),
        cpf,
        name,
        statement: []
    })

    return res.status(201).json({ ok: true })
})

app.get('/statement/:cpf', verifyIfExistsAccountCPF,(req, res) => {

    const { costumer } = req

    return res.status(201).json(costumer.statement)
})

app.listen(3333, () => {
    console.log(`Server running on port ${3333}`)
})