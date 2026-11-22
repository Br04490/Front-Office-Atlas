import React, { useEffect, useState } from 'react';
import { ShieldAlert, Video } from 'lucide-react';
import { loadSkillCornerEvents } from '../../services/skillcorner';

type Events = Awaited<ReturnType<typeof loadSkillCornerEvents>>;

export const SkillCornerVideoTab: React.FC<{ playerId: number }> = ({ playerId }) => {
  const [events, setEvents] = useState<Events | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setEvents(null);
    setError(false);
    loadSkillCornerEvents(playerId).then((result) => {
      if (active) setEvents(result);
    }).catch((err: unknown) => {
      console.error('[SkillCorner] Failed to load game events:', err);
      if (active) setError(true);
    });
    return () => { active = false; };
  }, [playerId]);

  const distances = events?.shots.map((shot) => shot.closestDefDist)
    .filter((value): value is number => value !== null && Number.isFinite(value)) ?? [];
  const averageDistance = distances.length
    ? `${(distances.reduce((sum, value) => sum + value, 0) / distances.length).toFixed(1)} ft`
    : '—';
  const metrics = events && [
    { label: 'Shot events', value: events.shots.length, detail: 'Includes fouled misses' },
    { label: 'Shots made', value: events.shots.filter((shot) => shot.outcome).length, detail: 'Game 184439' },
    { label: 'Contested shots', value: events.shots.filter((shot) => shot.contested === true).length, detail: 'SkillCorner classification' },
    { label: 'Avg defender distance', value: averageDistance, detail: 'At shot release' },
    { label: 'Screens set', value: events.screens, detail: 'On-ball picks' },
    { label: 'Drives', value: events.drives, detail: 'Ball handler' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1422] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-400" />
              <span>Computer Vision &amp; Video Intelligence Pipeline</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              SkillCorner game events: Real Madrid vs. Lenovo Tenerife, April 19, 2026.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>LABEL: ACB DERIVED TRACKING</span>
          </div>
        </div>
        <div className="p-3.5 bg-[#0a0d14] border border-purple-500/20 rounded-lg flex items-start gap-3 text-xs font-mono">
          <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            SkillCorner broadcast-derived events from Liga ACB 2025-26, not NBA tracking or video clips.
            Tracking estimates have limitations; see the{' '}
            <a className="text-purple-300 underline" href="https://github.com/SkillCorner/opendata-basketball" target="_blank" rel="noreferrer">SkillCorner documentation</a>.
          </p>
        </div>
        {error ? (
          <p role="alert" className="text-xs text-red-400">Unable to load SkillCorner game events.</p>
        ) : !events ? (
          <p className="text-xs text-neutral-400">Loading SkillCorner game events...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {metrics?.map((metric) => (
                <div key={metric.label} className="p-3 bg-[#141a2a] border border-white/5 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">{metric.label}</span>
                  <span className="font-mono text-base font-bold text-white">{metric.value}</span>
                  <span className="text-[10px] font-mono text-neutral-400 block">{metric.detail}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <h4 className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                SkillCorner Shot Events · ACB Game 184439
              </h4>
              <div className="border border-white/5 rounded-lg overflow-x-auto bg-[#0a0d14]">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-[#141a2a] text-neutral-400 text-[10px] uppercase border-b border-white/5">
                    <tr>
                      <th className="py-2.5 px-4">Event ID</th>
                      <th className="py-2.5 px-3">Period / Clock</th>
                      <th className="py-2.5 px-3">Court (X, Y)</th>
                      <th className="py-2.5 px-3">Defender Dist</th>
                      <th className="py-2.5 px-3">Action Type</th>
                      <th className="py-2.5 px-3">Shot Quality</th>
                      <th className="py-2.5 px-4 text-right">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px] text-neutral-300">
                    {events.shots.map((shot) => (
                      <tr key={shot.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-white font-bold">{shot.id}</td>
                        <td className="py-2.5 px-3 text-neutral-400">
                          Q{shot.period} / {shot.startGameClock === null ? '—' : `${shot.startGameClock.toFixed(1)}s`}
                        </td>
                        <td className="py-2.5 px-3">
                          {shot.location?.length === 2 ? `(${shot.location[0].toFixed(1)}, ${shot.location[1].toFixed(1)}) ft` : '—'}
                        </td>
                        <td className="py-2.5 px-3">{shot.closestDefDist === null ? '—' : `${shot.closestDefDist.toFixed(1)} ft`}</td>
                        <td className="py-2.5 px-3">{shot.shotType || '—'}</td>
                        <td className="py-2.5 px-3">{shot.shotQuality === null ? '—' : `${shot.shotQuality.toFixed(1)} / 100`}</td>
                        <td className="py-2.5 px-4 text-right text-purple-300 font-bold">
                          {shot.outcome ? 'MADE' : shot.fouled ? 'FOULED MISS' : 'MISSED'}
                        </td>
                      </tr>
                    ))}
                    {events.shots.length === 0 && (
                      <tr><td colSpan={7} className="py-2.5 px-4">No shot events recorded for this game.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
