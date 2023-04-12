const Participant = require('../model/Participants')

const postStatus = async (req, res) => {
    
    try {
      const user = req.headers.user;
  
      if (!user) {
        return res.status(404).json({ message: 'User is required on header.' });
      }
  
      const participant = await Participant.findOne({ name: user }).exec();
  
      if (!participant) {
        return res.status(404).json({ message: 'User not found on participants list.' });
      }
  
      participant.lastStatus = dayjs().format('HH:mm:ss');
      await participant.save();
  
      return res.status(200).json({ message: 'Participant status updated.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  };

module.exports = {
    postStatus
}