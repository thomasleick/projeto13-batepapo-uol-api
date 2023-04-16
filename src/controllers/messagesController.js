const Message = require("../model/Messages");
const Participant = require("../model/Participants");
const Joi = require('joi');
const dayjs = require('dayjs')

const getMessages = async (req, res) => {
    let limit = req.query.limit;
    const user = req.headers.user || req.headers.User;
    if (!user) {
        res.status(422).json({ 'message': 'user is required on header.' });
        return 422;
    }

    const limitSchema = Joi.number()
        .integer()
        .min(1)
        .required();
    try {
        if (limit) {
            const { error, value } = limitSchema.validate(limit);

            if (error) {
                res.status(422).send(error.message);
                return 422;
            }

            limit = value;
        } else
            limit = 0;
        const query = {
            $or: [
                { type: { $ne: 'private_message' } },
                { type: 'private_message', to: user },
                { type: 'private_message', from: user },
                { type: 'private_message', to: 'Todos' },
            ],
        };
        let messages
        if (limit) {
            messages = await Message.find(query)
            .sort({ time: -1 }) // sort by time in descending order
            .limit(limit); // limit the number of messages returned
        }
        else {
            messages = await Message.find(query)
            .sort({ time: -1 }); // sort by time in descending order
        }
        
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const postMessage = async (req, res) => {
    let isBody = true;
    const time = dayjs().format('HH:mm:ss');
    const { stripHtml } = await import('string-strip-html');
    const verifyBody = (req) => {
        if (req.body) {
            const user = req.headers.user || req.headers.User
            return { ...req.body, from: user };
        }
        isBody = false;
        return req;
    };
    const badBody = verifyBody(req);
    
    const body = {};

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

    const { error, value } = postMessageSchema.validate(badBody);

    if (error) {
        if (isBody) {
            res.status(422).json({ message: error.message });
        }
        console.log(error.message);
        return 422;
    }

    for (const prop in value) {
        body[prop] = stripHtml(value[prop]).result.trim();
    }

    const { from, to, text, type } = body;

    if (!await Participant.findOne({ name: from }).exec()) {
        if (isBody) {
            res.status(422).json({ message: 'Name not found on participants list...' });
        }
        return 422;
    }

    try {
        await Message.create({ from, to, text, type, time });

        if (isBody)
            res.status(201).json({ 'success': `Message from ${from} created on db!` });
        return 201;

    } catch (err) {
        if (isBody)
            res.status(500).json({ 'message': err.message });
        return 500;
    }

}

const deleteMessage = async (req, res) => {

    const { id } = req.params;
    const user = req.headers.user || req.headers.User;

    if (!id || !user) {
        res.status(422).json({ 'message': 'user is required on header and id on path params...' });
        return 422;
    }

    try {
        // Check if message with given ID exists
        const message = await Message.findOne({ _id: id }).exec();
        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return 404;
        }

        // Check if user is the owner of the message
        if (message.from !== user) {
            res.status(401).json({ message: 'Unauthorized' });
            return 401;
        }

        // Delete the message from the messages collection
        await Message.deleteOne({ _id: id }).exec();

        // Return success message
        res.json({ message: 'Message deleted successfully' });
        return 200;
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ 'message': err.message });
        return 500;
    }
}

const putMessage = async (req, res) => {

    const { id } = req.params;
    const user = req.headers.user || req.headers.User;

    if (!id || !user)
        return res.status(422).json({ 'message': 'user is required on header and id on path params...' });

    try {
        const messageSchema = Joi.object({
            to: Joi.string().required(),
            text: Joi.string().required(),
            type: Joi.string().valid('message', 'private_message').required(),
        });

        const { error, value } = messageSchema.validate(req.body);

        if (error) {
            res.status(422).json({ error: error.message });
            return 422;
        }
        const { to, text, type } = value;

        // Check if message with given ID exists
        const message = await Message.findOne({ _id: id }).exec();
        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return 404;
        }

        // Check if user is the owner of the message
        if (message.from !== user) {
            res.status(401).json({ message: 'Unauthorized' });
            return 401;
        }
        // Check if user is on Participants list
        if (!await Participant.findOne({ name: user }).exec()) {
            res.status(422).json({ message: 'Name not found on participants list...' });
            return 422;
        }

        // Update message with new params from body
        message.to = to;
        message.text = text;
        message.type = type;

        // Update message on db
        await message.save();

        res.json({ message: 'Message edited successfully' });
        return 200;
    }


    catch (err) {
        console.log(err)
        res.status(500).json({ 'message': err.message });
        return 500;
    }
}

module.exports = {
    getMessages,
    postMessage,
    deleteMessage,
    putMessage
};