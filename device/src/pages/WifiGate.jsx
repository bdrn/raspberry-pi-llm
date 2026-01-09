import { useEffect, useState } from "react";
import api from "../api";
import Start from "./Start";
import WifiSetup from "./WifiSetup";

const WifiGate = () => {
  const [isReady, setIsReady] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkWifi = async () => {
      try {
        const response = await api.get("/wifi/status");
        const wifi = response.data?.wifi || {};
        if (isMounted) {
          setNeedsSetup(!wifi.ok);
        }
      } catch (error) {
        if (isMounted) {
          setNeedsSetup(true);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    checkWifi();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-[100dvh] items-center justify-center text-slate-300">
        Checking Wi-Fi…
      </div>
    );
  }

  if (needsSetup) {
    return <WifiSetup />;
  }

  return <Start />;
};

export default WifiGate;
