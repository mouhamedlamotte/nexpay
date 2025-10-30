"use client";

import { useAppStore } from "@/stores/app.store";
import { useEffect, useState } from "react";

const AppLoading = () => {
  const { isAppLoading, loadingPhase } = useAppStore();
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!isAppLoading) return;

    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAppLoading]);

  if (!isAppLoading) return null;

  const getLogoColor = () => {
    const colors = [
      "text-blue-600",
      "text-[#BDEA07]",
      "text-orange-500",
      "text-yellow-500",
    ];
    return colors[animationPhase];
  };

  const getLoadingMessageFromPhase = (phase: typeof loadingPhase) => {
    switch (phase) {
      case "INITIALISATION":
        return "Initialisation de l'application...";
      case "AUTHENTIFICATION":
        return "Authentification...."
      case "PROJECT":
        return "Chargement des données du projet...";
      case "FINALISATION":
        return "Finalisation de la configuration...";
      default:
        return "Chargement...";
    }
  };

  const backgroundStyle = {
    background: `linear-gradient(135deg, #0E1727 0%, #182438 100%)`,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-800 ease-in-out"
      style={backgroundStyle}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Logo animé */}
        <div className="relative">
          <div
            className={`relative z-10 transform transition-all duration-500 ${getLogoColor()}`}
          >
            <span className="text-6xl font-bold">NEXPAY</span>
          </div>
        </div>

        {/* Texte de chargement */}
        <div className="text-center space-y-4">
          <p className="text-gray-600 text-2xl animate-fade-in w-[500px]">
            {getLoadingMessageFromPhase(loadingPhase)}
          </p>
        </div>
      </div>

    </div>
  );
};

export default AppLoading;
