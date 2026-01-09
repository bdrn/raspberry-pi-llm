import os
import shutil
import subprocess


class WifiSetupError(RuntimeError):
    pass


def wifi_setup_enabled():
    return os.getenv("WIFI_SETUP_ENABLED", "").lower() in {"1", "true", "yes", "on"}


def _ensure_nmcli():
    if not shutil.which("nmcli"):
        raise WifiSetupError("nmcli is not available on this device.")


def connect_wifi(ssid, password=None):
    _ensure_nmcli()
    command = ["nmcli", "dev", "wifi", "connect", ssid]
    if password:
        command += ["password", password]

    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        message = result.stderr.strip() or result.stdout.strip() or "Wi-Fi connect failed."
        raise WifiSetupError(message)

    return {"status": "connected", "ssid": ssid, "output": result.stdout.strip()}


def get_active_wifi():
    _ensure_nmcli()
    result = subprocess.run(
        ["nmcli", "-t", "-f", "ACTIVE,SSID,DEVICE", "dev", "wifi"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        message = result.stderr.strip() or result.stdout.strip() or "Wi-Fi status failed."
        raise WifiSetupError(message)

    active_ssid = None
    active_device = None
    for line in result.stdout.splitlines():
        parts = line.split(":", 2)
        if len(parts) < 3:
            continue
        active, ssid, device = parts
        if active == "yes":
            active_ssid = ssid or None
            active_device = device or None
            break

    return {"ssid": active_ssid, "device": active_device}


def get_connectivity():
    _ensure_nmcli()
    result = subprocess.run(
        ["nmcli", "-t", "-f", "CONNECTIVITY", "general"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        message = result.stderr.strip() or result.stdout.strip() or "Connectivity check failed."
        raise WifiSetupError(message)

    connectivity = result.stdout.strip() or "unknown"
    return connectivity


def list_networks():
    _ensure_nmcli()
    result = subprocess.run(
        ["nmcli", "-t", "-f", "SSID,SECURITY,SIGNAL", "dev", "wifi", "list"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        message = result.stderr.strip() or result.stdout.strip() or "Wi-Fi scan failed."
        raise WifiSetupError(message)

    networks = []
    for line in result.stdout.splitlines():
        parts = line.split(":", 2)
        if len(parts) < 3:
            continue
        ssid, security, signal = parts
        ssid = ssid.strip()
        if not ssid:
            continue
        networks.append(
            {
                "ssid": ssid,
                "security": security.strip() or "unknown",
                "signal": int(signal) if signal.isdigit() else None,
            }
        )

    deduped = {}
    for entry in networks:
        ssid = entry["ssid"]
        current = deduped.get(ssid)
        if not current or (entry["signal"] or 0) > (current["signal"] or 0):
            deduped[ssid] = entry

    return sorted(deduped.values(), key=lambda item: item["signal"] or 0, reverse=True)
