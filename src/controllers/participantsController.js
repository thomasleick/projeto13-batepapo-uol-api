const Participant = require('../model/Participants');
const { postMessage } = require("./messagesController");

const postParticipant = async (req, res) => {
    if (!req?.body?.name) return res.status(422).json({'message': 'name is required.'});
    if (typeof req?.body?.name !== 'string') return res.status(422).json({'message': 'name must be a string.'});

    const { stripHtml } = await import('string-strip-html');
    const name = stripHtml(req?.body?.name).result.trim();

    const duplicate = await Participant.findOne({ name: name }).exec();
    if (duplicate) return res.sendStatus(409) //Conflict
    try {
        await Participant.create({ 
            "name": name, 
            "lastStatus": new Date().getTime()
        });

        const returnStatus = await postMessage( 
            { 
                from: name, 
                to: 'Todos', 
                text: 'entra na sala...', 
                type: 'status', 
            }
        );
        if (returnStatus === 201)
            return res.status(201).json({ 'success': `New participant ${name} created!`});
    } catch (err) {
        return res.status(500).json({'message': err.message});
    }
}


const getParticipants = async (req, res) => {

    try {
        const result = await Participant.find();
        
        if (!result) return res.status(204).json([]);
       
        return res.json(result);

    } catch (err) {
        return res.status(500).json({ 'message': err.message });
    }
}

module.exports = {
    postParticipant,
    getParticipants
};