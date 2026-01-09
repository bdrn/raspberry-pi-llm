import QRCode from "react-qr-code";

const buildSettingsUrl = () => {
  const dashboardBase = import.meta.env.VITE_DESKTOP_FRONTEND_URL;
  const deviceApi =
    import.meta.env.VITE_DEVICE_API_URL ||
    (typeof window !== "undefined"
      ? `http://${window.location.hostname}:5001/api`
      : "");

  if (!dashboardBase) {
    return { url: "", deviceApi };
  }

  const params = new URLSearchParams({ device_api: deviceApi });
  return {
    url: `${dashboardBase.replace(/\/$/, "")}/settings?${params.toString()}`,
    deviceApi,
  };
};

const WifiSetup = () => {
  const { url, deviceApi } = buildSettingsUrl();
  const hotspotName = import.meta.env.VITE_WIFI_AP_SSID || "StudyBuddy-Setup";

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-6 px-4 py-4 text-center">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Wi-Fi setup
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-50">
          Connect Study Buddy to Wi-Fi
        </h1>
        <p className="max-w-xl text-base text-slate-300">
          Join the <span className="font-semibold">{hotspotName}</span> hotspot
          on your phone, then scan the QR code to open the setup page.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-700/60 bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        {url ? (
          <QRCode value={url} size={220} />
        ) : (
          <p className="w-52 text-sm text-slate-500">
            Set VITE_DESKTOP_FRONTEND_URL to generate a QR code.
          </p>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-300">
        <p>Or open this URL on your phone:</p>
        <p className="rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 font-mono text-xs text-slate-200">
          {url || "Set VITE_DESKTOP_FRONTEND_URL in the device app."}
        </p>
        <p className="text-xs text-slate-400">
          Device API: {deviceApi || "Not available"}
        </p>
      </div>
    </div>
  );
};

export default WifiSetup;
