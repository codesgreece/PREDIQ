import { PredictionForm } from "@/components/admin/prediction-form";

export default function NewPredictionPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Create prediction
      </h1>
      <p className="mt-2 mb-8 text-sm text-[var(--text-muted)]">
        Saving creates a private draft. Publishing requires an explicit action.
      </p>
      <PredictionForm />
    </div>
  );
}
