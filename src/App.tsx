import React, { useState } from 'react';
import { TeamService, PlayerService } from './services';
import { Team, Player } from './types';
import { Navbar } from './components/Navbar';
import { LeagueView } from './views/LeagueView';
import { TeamPage } from './views/TeamPage';
import { CapApronView } from './views/CapApronView';
import { TradeLabView } from './views/TradeLabView';
import { DraftLedgerView } from './views/DraftLedgerView';
import { GLeagueView } from './views/GLeagueView';
import { InjuriesView } from './views/InjuriesView';
import { ProspectsView } from './views/ProspectsView';
import { ScenariosView } from './views/ScenariosView';
import { SourceDeskView } from './views/SourceDeskView';
import { TwoWayCommandView } from './views/TwoWayCommandView';
import { AskCbaDrawer } from './components/AskCbaDrawer';
import { AskAtlasModal } from './components/AskAtlasModal';
import { PlayerDetailDrawer } from './components/PlayerDetailDrawer';
import { CommandPalette } from './components/CommandPalette';

export default function App() {
  const [currentNav, setCurrentNav] = useState<string>('League');
  // Houston Rockets is the initial featured/pilot team per prompt
  const [currentTeamSlug, setCurrentTeamSlug] = useState<string>('houston-rockets');
  
  // Modal / Drawer states
  const [isAskCbaOpen, setIsAskCbaOpen] = useState(false);
  const [cbaQueryPrompt, setCbaQueryPrompt] = useState<string>('');
  const [cbaPlayerContext, setCbaPlayerContext] = useState<Player | undefined>(undefined);
  
  const [isAskAtlasOpen, setIsAskAtlasOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const currentTeam: Team = TeamService.getTeamBySlug(currentTeamSlug) || TeamService.getFeaturedPilotTeam();

  const handleSelectTeam = (slug: string) => {
    setCurrentTeamSlug(slug);
    setCurrentNav('Teams');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAskCba = (prompt?: string, player?: Player) => {
    setCbaQueryPrompt(prompt || '');
    setCbaPlayerContext(player);
    setIsAskCbaOpen(true);
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-neutral-100">
      {/* Persistent Executive Navigation Header */}
      <Navbar
        currentNav={currentNav}
        onSelectNav={(nav) => {
          setCurrentNav(nav);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentTeam={currentTeam}
        onSelectTeam={handleSelectTeam}
        onOpenAskCba={handleOpenAskCba}
        onOpenAskAtlas={() => setIsAskAtlasOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-6">
        {currentNav === 'League' && (
          <LeagueView onSelectTeam={handleSelectTeam} />
        )}

        {currentNav === 'Teams' && (
          <TeamPage
            team={currentTeam}
            onSelectTeam={handleSelectTeam}
            onSelectPlayer={handleSelectPlayer}
            onOpenCba={handleOpenAskCba}
          />
        )}

        {currentNav === 'Cap & Apron' && (
          <CapApronView onOpenCba={handleOpenAskCba} />
        )}

        {currentNav === 'Trade Lab' && (
          <TradeLabView onOpenCba={handleOpenAskCba} />
        )}

        {currentNav === 'Two-Way Command' && (
          <TwoWayCommandView onSelectPlayerName={(name) => {
            // Find player and open drawer if matches
            const match = PlayerService.getPlayersByTeam(currentTeam.id).find((p) => p.full_name === name);
            if (match) setSelectedPlayer(match);
          }} />
        )}

        {currentNav === 'Draft Ledger' && (
          <DraftLedgerView />
        )}

        {currentNav === 'G League' && (
          <GLeagueView onSelectTeam={handleSelectTeam} />
        )}

        {currentNav === 'Injuries' && (
          <InjuriesView />
        )}

        {currentNav === 'Prospects' && (
          <ProspectsView />
        )}

        {currentNav === 'Scenarios' && (
          <ScenariosView onOpenCba={handleOpenAskCba} />
        )}

        {currentNav === 'Sources' && (
          <SourceDeskView />
        )}
      </main>

      {/* Persistent Global Drawers & Modals */}
      <AskCbaDrawer
        isOpen={isAskCbaOpen}
        onClose={() => setIsAskCbaOpen(false)}
        initialQuery={cbaQueryPrompt}
        initialPlayer={cbaPlayerContext}
        currentTeam={currentTeam}
      />

      <AskAtlasModal
        isOpen={isAskAtlasOpen}
        onClose={() => setIsAskAtlasOpen(false)}
        onSelectTeam={handleSelectTeam}
      />

      <PlayerDetailDrawer
        player={selectedPlayer}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onAskCba={(query, player) => {
          setSelectedPlayer(null);
          handleOpenAskCba(query, player);
        }}
      />

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTeam={handleSelectTeam}
        onSelectNav={(nav) => setCurrentNav(nav)}
        onOpenCba={handleOpenAskCba}
      />

      {/* Quiet Front-Office Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#090b0e] py-6 px-4 sm:px-6 text-xs text-neutral-500 font-mono">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-neutral-400">FRONT OFFICE ATLAS</span>
            <span>·</span>
            <span>NBA Executive Decision Platform</span>
            <span>·</span>
            <span>2023–2030 CBA Compliance</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-neutral-500">
            <span>Houston Rockets Pilot Environment</span>
            <span>·</span>
            <span>Supabase / REST Connector Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
