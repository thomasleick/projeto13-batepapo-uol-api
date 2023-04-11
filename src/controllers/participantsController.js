const Participant = require('../model/Participants');
const Message = require("../model/Messages")

const postParticipant = async (req, res) => {
    const { name } = req?.body
    if (!name) return res.status(422).json({'message': 'name is required.'})
    if (!typeof name === 'string') return res.status(422).json({'message': 'name must be a string.'})
    const duplicate = await Participant.findOne({ name: name }).exec()
    if (duplicate) return res.sendStatus(409) //Conflict
    try {
        const result = await Participant.create({ 
            "name": name, 
            "lastStatus": Date.now() 
        })

        const returnStatus = await postMessage( 
            { 
                from :name, 
                to: 'Todos', 
                text: 'entra na sala...', 
                type: 'status', 
                time: Date.now()
            }
        )
        if (returnStatus === 201)
            return res.status(201).json({ 'success': `New participant ${name} created!`})
    } catch (err) {
        return res.status(500).json({'message': err.message})
    }
}

const postMessage = async(req, res) => {
    let isBody = true
    console.log(req)

    verifyBody = () => {
        if (req?.body)
            return req.body
        isBody = false
        return req
    }
    const { from, to, text, type, time } = verifyBody()

    try {
        const result = await Message.create({ from, to, text, type, time })

        console.log(result)
        if (isBody)
            return res.status(201).json({ 'success': `New participant ${name} created!`})
        return 201
    } catch (err) {
        if(isBody)
            return res.status(500).json({'message': err.message})
        return 500
    }

}

const getParticipants = async (req, res) => {

    try {
        const result = await Participant.find()
        
        if (!result) return res.status(204).json([]);

        const participantsList = result.map(participant => participant.name)
        
        res.json(participantsList);

    } catch (err) {
        return res.status(500).json({ 'message': err.message })
    }
}

module.exports = {
    postParticipant,
    getParticipants
}