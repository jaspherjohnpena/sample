import dbConnect from '../../lib/dbConnect'; // kung meron kang db connect file
import Event from '../../models/Event';
import Attendee from '../../models/Attendee';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const totalEvents = await Event.countDocuments();
    const totalAttendees = await Attendee.countDocuments();

    res.status(200).json({ totalEvents, totalAttendees });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
