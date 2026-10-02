import React from 'react';
import { Player } from '../../types';
import { Video, ShieldAlert, Cpu, Eye, Activity, CheckCircle2 } from 'lucide-react';

interface PlayerVideoTabProps {
  player: Player;
}

export const PlayerVideoTab: React.FC<PlayerVideoTabProps> = ({ player }) => {
  return (
    <div className="space-y-6">
      {/* 1. Header & Architecture Notice */}
      <div className="bg-[#0f1422] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-400" />
                <span>Computer Vision & Video Intelligence Pipeline</span>
              </h3>
              <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                YOLO Court Homography v1.2
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Automated video tracking ingest extracting positional coordinates, defender distance, roll depth, and closeout velocities.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>LABEL: DERIVED TRACKING</span>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="p-3.5 bg-[#0a0d14] border border-purple-500/20 rounded-lg flex items-start gap-3 text-xs font-mono">
          <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-purple-300 font-bold block uppercase">
              Compliance Standard · Derived Spatial Estimates
            </span>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Spatial coordinates in this module are generated through automated video homography and computer-vision neural networks. They are strictly classified as <span className="text-white font-bold">DERIVED TRACKING</span> and must never be conflated with official Second Spectrum NBA in-arena optical tracking.
            </p>
          </div>
        </div>

        {/* 6 Derived Computer-Vision Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 bg-[#141a2a] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Top Sprint Speed</span>
            <span className="font-mono text-base font-bold text-white">18.4 MPH</span>
            <span className="text-[10px] font-mono text-purple-400 block">Transition Burst</span>
          </div>

          <div className="p-3 bg-[#141a2a] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Avg Distance / 48</span>
            <span className="font-mono text-base font-bold text-white">2.82 Miles</span>
            <span className="text-[10px] font-mono text-neutral-400 block">Workload Tier</span>
          </div>

          <div className="p-3 bg-[#141a2a] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Nearest Defender Dist</span>
            <span className="font-mono text-base font-bold text-emerald-400">4.8 Feet</span>
            <span className="text-[10px] font-mono text-neutral-400 block">At Shot Release</span>
          </div>

          <div className="p-3 bg-[#141a2a] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Pick & Roll Depth</span>
            <span className="font-mono text-base font-bold text-amber-300">11.2 Feet</span>
            <span className="text-[10px] font-mono text-neutral-400 block">Screen Set Location</span>
          </div>

          <div className="p-3 bg-[#141a2a] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Cut Deceleration</span>
            <span className="font-mono text-base font-bold text-sky-400">4.1 m/s²</span>
            <span className="text-[10px] font-mono text-neutral-400 block">Spatial Separation</span>
          </div>

          <div className="p-3 bg-[#141a2a] border border-white/5 rounded-lg space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">Neural Confidence</span>
            <span className="font-mono text-base font-bold text-purple-300">96.4%</span>
            <span className="text-[10px] font-mono text-emerald-400 block">Model Verified</span>
          </div>
        </div>

        {/* Video Possession Staged Ingestion Queue */}
        <div className="pt-2">
          <h4 className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
            Staged Video Frame Ingestion Log (Recent Possessions)
          </h4>
          <div className="border border-white/5 rounded-lg overflow-x-auto bg-[#0a0d14]">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-[#141a2a] text-neutral-400 text-[10px] uppercase border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-4">Game / Clip ID</th>
                  <th className="py-2.5 px-3">Possession</th>
                  <th className="py-2.5 px-3">Court (X, Y)</th>
                  <th className="py-2.5 px-3">Defender Dist</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-4 text-right">Data Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] text-neutral-300">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 text-white font-bold">clip_20261001_q1_042</td>
                  <td className="py-2.5 px-3 text-neutral-400">#42 (Q1 08:14)</td>
                  <td className="py-2.5 px-3">(24.8 ft, 18.2 ft)</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">5.4 ft (Open)</td>
                  <td className="py-2.5 px-3">Corner Cut to Rim</td>
                  <td className="py-2.5 px-3">97.8%</td>
                  <td className="py-2.5 px-4 text-right text-purple-300 font-bold">DERIVED TRACKING</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 text-white font-bold">clip_20261001_q2_089</td>
                  <td className="py-2.5 px-3 text-neutral-400">#89 (Q2 03:22)</td>
                  <td className="py-2.5 px-3">(48.2 ft, 25.0 ft)</td>
                  <td className="py-2.5 px-3 text-amber-300 font-semibold">3.1 ft (Contested)</td>
                  <td className="py-2.5 px-3">High Pick & Roll</td>
                  <td className="py-2.5 px-3">96.2%</td>
                  <td className="py-2.5 px-4 text-right text-purple-300 font-bold">DERIVED TRACKING</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
