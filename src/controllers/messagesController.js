const Message = require("../model/Messages")
const Participant = require("../model/Participants")
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
    const time = Date.now();

    const verifyBody = (req) => {
        if (req.body) {
          return { ...req.body, from: req.headers?.user };
        }
        return req;
      };
      const body = verifyBody(req);
      const isBody = body.type === 'message' || body.type === 'private_message';
    
      const postMessageSchema = isBody
        ? Joi.object({
            from: Joi.string().required(),
            to: Joi.string().required(),
            text: Joi.string().required(),
            type: Joi.string().valid('message', 'private_message').required(),
          })
        : Joi.object({
            from: Joi.string().required(),
            to: Joi.string().required(),
            text: Joi.string().required(),
            type: Joi.string().valid('status').required(),
          });
    
      const { error, value } = postMessageSchema.validate(body);

      if (error) {
        if (isBody)
            return res.status(422).json({ message: error.message });
        console.log(error.message)
        return 422
      }
  
    const { from, to, text, type } = value;

    if (!await Participant.findOne({ name: from }).exec()) {
        if (isBody)
            return res.status(422).json({ message: 'Name not found on participants list...' });
        return 422;
    }

    try {
        const result = await Message.create({ from, to, text, type, time })

        if (isBody)
            return res.status(201).json({ 'success': `New participant ${from} created!`})
        return 201;

    } catch (err) {
        if(isBody)
            return res.status(500).json({'message': err.message})
        return 500;
    }

}


module.exports = {
    getMessages,
    postMessage
}