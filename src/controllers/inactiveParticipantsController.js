const Participant = require('../model/Participants');
const { postMessage } = require('./messagesController');
const dayjs = require('dayjs')

const removeInactiveParticipants = async () => {
  try {
    const tenSecondsAgo =  new Date((new Date()).getTime() - 10000); // 10 seconds in milliseconds
    const inactiveParticipants = await Participant.find({ lastStatus: { $lt: tenSecondsAgo } }).exec();

    if (inactiveParticipants.length > 0) {
      console.log(`Removing ${inactiveParticipants.length} inactive participants...`);

      // Post a new message for each removed participant
      for (const participant of inactiveParticipants) {
        const { name } = participant;
        await postMessage(
            {
                from: name,
                to: 'Todos',
                text: 'sai da sala...',
                type: 'status'
            });
      }
    }
    await Participant.deleteMany({ lastStatus: { $lt: tenSecondsAgo } }).exec();
  } catch (err) {
    console.error('Error removing inactive participants:', err);
    return -1;
  }
  return 0;
};

module.exports = {
  removeInactiveParticipants,
};