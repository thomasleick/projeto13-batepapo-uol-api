const Message = require("../model/Messages")
const Joi = require('joi');

const getMessages = async (req, res) => {
    let limit = req.query.limit;
    const user = req.headers.user;

    if (!user)
        return res.status(422).json({'message': 'user is required on header.'})

    const limitSchema = Joi.number()
        .integer()
        .min(1)
        .required();

    try {
        if (limit) {
            const { error, value } = limitSchema.validate(limit);
    
            if (error) {
                res.status(422).send(error.details[0].message);
                return;
            }
    
            limit = value;
        } else
            limit = Infinity;
        
        const query = {
            $or: [
              { type: { $ne: 'private_message' } },
              { type: 'private_message', to: user },
              { type: 'private_message', from: user },
              { type: 'private_message', to: 'Todos' },
            ],
          };
        const messages = await Message.find(query)
            .sort({ time: -1 }) // sort by time in descending order
            .limit(limit); // limit the number of messages returned
        res.json(messages);
      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
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
            return res.status(201).json({ 'success': `New participant ${from} created!`})
        return 201
    } catch (err) {
        if(isBody)
            return res.status(500).json({'message': err.message})
        return 500
    }

}


module.exports = {
    getMessages,
    postMessage
}