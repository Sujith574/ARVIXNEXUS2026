import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Submission from '@/models/Submission';
import Score from '@/models/Score';
import Team from '@/models/Team';
import SystemSetting from '@/models/SystemSetting';

export async function GET() {
  try {
    await dbConnect();

    // Check leaderboard visibility settings
    const visibilitySetting = await SystemSetting.findOne({ key: 'leaderboard_visible' });
    if (visibilitySetting && visibilitySetting.value === false) {
      return NextResponse.json({ leaderboard: [], is_hidden: true });
    }

    // Ensure models are registered for lookups
    const _dummyScore = Score.modelName;
    const _dummyTeam = Team.modelName;

    // Run aggregation starting from Submissions that are submitted
    const leaderboard = await Submission.aggregate([
      {
        $match: { status: 'submitted' }
      },
      // 1. Join scores
      {
        $lookup: {
          from: 'scores',
          localField: '_id',
          foreignField: 'submission_id',
          as: 'scores'
        }
      },
      // 2. Join teams
      {
        $lookup: {
          from: 'teams',
          localField: 'team_id',
          foreignField: '_id',
          as: 'team'
        }
      },
      {
        $unwind: '$team'
      },
      // 3. Project average total scores
      {
        $project: {
          team_id: '$team._id',
          team_name: '$team.name',
          project_title: '$title',
          repo_url: '$repo_url',
          judges_count: { $size: '$scores' },
          total_score: {
            $cond: {
              if: { $gt: [{ $size: '$scores' }, 0] },
              then: {
                $round: [
                  {
                    $avg: {
                      $map: {
                        input: '$scores',
                        as: 's',
                        in: {
                          $add: [
                            '$$s.criteria_scores.innovation',
                            '$$s.criteria_scores.impact',
                            '$$s.criteria_scores.technical',
                            '$$s.criteria_scores.presentation'
                          ]
                        }
                      }
                    }
                  },
                  1
                ]
              },
              else: 0
            }
          }
        }
      },
      // 4. Sort by score descending
      {
        $sort: { total_score: -1, team_name: 1 }
      }
    ]);

    return NextResponse.json({ leaderboard });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
