import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Settings = () => {
  const location = useLocation();
  const deviceApiBase = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("device_api") || "";
  }, [location.search]);

  const deviceApi = useMemo(() => {
    if (!deviceApiBase) return null;
    return axios.create({ baseURL: deviceApiBase });
  }, [deviceApiBase]);

  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [networks, setNetworks] = useState([]);
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [listError, setListError] = useState("");
  const [connectError, setConnectError] = useState("");
  const [connectSuccess, setConnectSuccess] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStatus = async () => {
    if (!deviceApi) return;
    setStatusError("");
    try {
      const response = await deviceApi.get("/wifi/status");
      setStatus(response.data.wifi || null);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        "Unable to read Wi-Fi status from the device.";
      setStatusError(message);
    }
  };

  const loadNetworks = async () => {
    if (!deviceApi) return;
    setListError("");
    try {
      const response = await deviceApi.get("/wifi/networks");
      setNetworks(response.data.networks || []);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        "Unable to scan for Wi-Fi networks.";
      setListError(message);
    }
  };

  useEffect(() => {
    if (!deviceApi) return;
    setIsRefreshing(true);
    Promise.all([loadStatus(), loadNetworks()]).finally(() => {
      setIsRefreshing(false);
    });
  }, [deviceApi]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setConnectError("");
    setConnectSuccess("");

    if (!deviceApi) {
      setConnectError("Device API is not set. Scan the QR code again.");
      return;
    }

    if (!ssid.trim()) {
      setConnectError("SSID is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await deviceApi.post("/wifi/connect", {
        ssid: ssid.trim(),
        password: password.trim(),
      });
      setConnectSuccess(
        `Connected to ${response.data.ssid || ssid.trim()}.`
      );
      await loadStatus();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        "Unable to connect to the Wi-Fi network.";
      setConnectError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-slate-400">
          Settings
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Device Wi-Fi
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Scan the QR code on the Study Buddy device to connect here, then
          choose a Wi-Fi network for the device.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold text-slate-50">
            Connect to Wi-Fi
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Pick a network or enter the SSID manually.
          </p>

          {deviceApiBase ? (
            <p className="mt-3 rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-2 text-xs text-slate-400">
              Device API: {deviceApiBase}
            </p>
          ) : (
            <p className="mt-3 rounded-2xl border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-xs text-amber-100">
              Scan the QR code on the device to open this page with the correct
              link.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Available networks
              <select
                value={ssid}
                onChange={(event) => setSsid(event.target.value)}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-base text-slate-50 focus:border-sky-400 focus:outline-none"
              >
                <option value="">Select a network</option>
                {networks.map((network) => (
                  <option key={network.ssid} value={network.ssid}>
                    {network.ssid}
                    {network.signal ? ` (${network.signal}%)` : ""}
                    {network.security && network.security !== "unknown"
                      ? ` • ${network.security}`
                      : ""}
                  </option>
                ))}
              </select>
              {listError ? (
                <span className="text-xs text-amber-200">{listError}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Network name (SSID)
              <input
                value={ssid}
                onChange={(event) => setSsid(event.target.value)}
                placeholder="e.g. Home Wi-Fi"
                className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Optional for open networks"
                className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
            </label>

            {connectError ? (
              <p className="rounded-2xl border border-rose-500/60 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
                {connectError}
              </p>
            ) : null}

            {connectSuccess ? (
              <p className="rounded-2xl border border-emerald-400/60 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
                {connectSuccess}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!deviceApi || isSubmitting}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 text-center text-base font-semibold text-slate-50 transition hover:border-sky-400/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Connecting..." : "Connect Wi-Fi"}
            </button>
          </form>
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 text-sm text-slate-300">
          <h3 className="text-base font-semibold text-slate-50">
            Current connection
          </h3>
          {statusError ? (
            <p className="rounded-2xl border border-amber-400/60 bg-amber-400/10 px-4 py-2 text-amber-100">
              {statusError}
            </p>
          ) : (
            <div className="space-y-2">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  SSID
                </p>
                <p className="mt-1 text-base text-slate-100">
                  {status?.ssid || "Not connected"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Connectivity
                </p>
                <p className="mt-1 text-base text-slate-100">
                  {status?.connectivity || "Unknown"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRefreshing(true);
                  Promise.all([loadStatus(), loadNetworks()]).finally(() =>
                    setIsRefreshing(false)
                  );
                }}
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-center text-sm font-semibold text-slate-100 transition hover:border-sky-400/70"
              >
                {isRefreshing ? "Refreshing..." : "Refresh status"}
              </button>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default Settings;
