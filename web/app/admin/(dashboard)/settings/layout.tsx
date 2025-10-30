import { SettingsNav } from "@/components/settings/settingsNav";
import React from "react";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex-1 overflow-y-auto p-2 md:p-6 space-y-4">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Paramétres du compte</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <SettingsNav />
        <div className="grid gap-6">{children}</div>
      </div>
    </main>
  );
};

export default SettingsLayout;
