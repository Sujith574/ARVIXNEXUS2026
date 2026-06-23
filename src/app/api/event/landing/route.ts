import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EventAgenda from '@/models/EventAgenda';
import Profile from '@/models/Profile';
import HackathonRound from '@/models/HackathonRound';

export async function GET() {
  try {
    await dbConnect();

    // Ensure Profile is registered for populating
    const _dummyProfile = Profile.modelName;

    // Fetch agenda ordered by start time
    const agendaData = await EventAgenda.find()
      .populate('speaker_id')
      .sort({ start_time: 1 });

    const formattedAgenda = agendaData.map((item) => {
      const speakerDoc = item.speaker_id as any;
      return {
        ...item.toObject(),
        id: item._id.toString(),
        speaker: speakerDoc ? {
          full_name: speakerDoc.full_name,
          role: speakerDoc.role,
        } : null,
      };
    });

    // Fetch speakers (profiles with role admin or super_admin)
    const speakersList = await Profile.find({
      role: { $in: ['admin', 'super_admin'] },
    }).limit(3);

    const formattedSpeakers = speakersList.map((s) => ({
      ...s.toObject(),
      id: s._id.toString(),
    }));

    // Fetch Hackathon Rounds
    const roundsList = await HackathonRound.find().sort({ round_number: 1 });
    const formattedRounds = roundsList.map((r) => ({
      ...r.toObject(),
      id: r._id.toString(),
    }));

    return NextResponse.json({
      agenda: formattedAgenda,
      speakers: formattedSpeakers,
      rounds: formattedRounds,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
