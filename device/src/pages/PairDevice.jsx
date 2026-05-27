import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const PairDevice = () => {
  return (
    <div className="mx-auto max-w-xl space-y-4 px-3 py-3">
      <header className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-slate-400">
          Devices
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Pair a new device
        </h1>
        <p className="max-w-xl text-[11px] text-slate-400">
          Generate a QR code to link your Study Buddy device with this web
          dashboard. Once paired, new quizzes will sync automatically.
        </p>
      </header>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-sm text-slate-50">
            Pair with QR code
          </CardTitle>
          <CardDescription>
            Scan this with your Study Buddy device to complete the pairing flow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-[11px] text-slate-500">
            QR code placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PairDevice;
