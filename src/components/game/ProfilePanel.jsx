import React from "react";
import { User, Mail, Flag, Building2, LogOut } from "lucide-react";
import { factionFlag } from "@/lib/gameData";
import { useAuth } from "@/lib/AuthContext";
import SectionTitle from "./SectionTitle";
import { Button } from "@/components/ui/button";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
      <Icon className="w-4 h-4 text-brass shrink-0" strokeWidth={1.6} />
      <div className="leading-tight min-w-0">
        <div className="text-[10px] uppercase tracking-[0.16em] text-ink-dim font-body-game">{label}</div>
        <div className="text-sm font-display text-ink truncate">{value || "—"}</div>
      </div>
    </div>
  );
}

export default function ProfilePanel({ player, factionByCode }) {
  const { user, logout } = useAuth();
  const faction = factionByCode?.[player?.factionCode];

  return (
    <div className="panel rounded-sm h-full flex flex-col max-w-xl">
      <SectionTitle>Profil</SectionTitle>

      <div className="px-4 py-5 border-b border-line flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-wood-light border border-brass flex items-center justify-center">
          <User className="w-6 h-6 text-brass" strokeWidth={1.4} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-lg text-brass-bright">{user?.full_name || "Kapitän"}</div>
          <div className="text-sm text-ink-dim font-body-game">{player?.companyName || "Ohne Kompanie"}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll">
        <Row icon={Mail} label="E-Mail" value={user?.email} />
        <Row
          icon={Flag}
          label="Großfraktion"
          value={faction ? `${factionFlag(player?.factionCode)} ${faction.name}` : null}
        />
        <Row icon={Building2} label="Kompanie" value={player?.companyName} />
      </div>

      <div className="p-3 border-t border-line">
        <Button
          onClick={() => logout(true)}
          className="w-full bg-[var(--blood)] hover:bg-[var(--blood)]/85 text-ink font-display tracking-wide border-0"
        >
          <LogOut className="w-4 h-4 mr-2" /> Abmelden
        </Button>
      </div>
    </div>
  );
}