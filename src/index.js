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

function getBalance(statement){
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount
        } else {
            return acc - operation.amount
        }
    }, 0)

    return balance
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

app.post('/deposit/:cpf', verifyIfExistsAccountCPF,(req, res) => {
    
    const { description, amount } = req.body

    const { costumer } = req

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    }

    costumer.statement.push(statementOperation)

    return res.status(201).json({ ok: true })
})

app.post('/withdraw/:cpf', verifyIfExistsAccountCPF,(req, res) => {

    const { amount } = req.body

    const { costumer } = req

    const balance = getBalance(costumer.statement)

    if(balance < amount){
        return res.status(400).json({ ok: false, message: 'Saldo insuficiente.'})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }

    costumer.statement.push(statementOperation)

    costumer.statement.push(statementOperation)

    return res.status(201).json({ ok: true })
})

app.get('/statement/:cpf/date', verifyIfExistsAccountCPF,(req, res) => {

    const { costumer } = req

    const { date } = req.query

    const dateFormat = new Date(date + ' 00:00')

    const statement = costumer.statement.filter(statement =>
         statement.created_at.toDateString() === 
         new Date(dateFormat).toDateString())

    return res.status(201).json(statement)
})

app.put('/account/:cpf', verifyIfExistsAccountCPF,(req, res) => {

    const { name } = req.body

    const { costumer } = req

    costumer.name = name 

    return res.status(201).json({ ok: true })
})

app.delete('/account/:cpf', verifyIfExistsAccountCPF,(req, res) => {

    const { costumer } = req

    costumers.splice(costumer, 1)
 
    return res.status(200).json({ ok: true, data: costumers })
})

app.get('/balance/:cpf', verifyIfExistsAccountCPF,(req, res) => {

    const { costumer } = req

    const balance = getBalance(costumer.statement)
 
    return res.status(200).json({ ok: true, data: balance })
})

app.listen(3333, () => {
    console.log(`Server running on port ${3333}`)
})