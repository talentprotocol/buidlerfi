import { AddToHomeScreen } from "@mui/icons-material";
import { Button } from "@mui/joy";
import { useEffect, useState } from "react";

type InstallEvent = {
  prompt?: () => void;
  userChoice?: Promise<{ outcome: string }>;
  preventDefault: () => void;
};

export function AddToHomePage() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const beforeInstallPromptHandler = (e: InstallEvent) => {
      if (e) {
        e.preventDefault();
        setInstallEvent(e);
      }
    };

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);

    return () => {
      return window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installEvent) return;

    if (installEvent.prompt) {
      installEvent?.prompt();
    }
    if (!installEvent.userChoice) return;

    installEvent.userChoice.then(choiceResult => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
    });
  };

  if (!installEvent) {
    return null;
  }

  return (
    <Button onClick={handleInstallClick} disabled={!!installEvent}>
      <AddToHomeScreen />
      Add to Home Screen
    </Button>
  );
}
