import { PredictionForm } from "@/components/admin/prediction-form";

export default function NewPredictionPage() {
  return (
    <div>
      <h1 className="page-title">Νέο προγνωστικό</h1>
      <p className="section-subtitle mb-4">
        Η αποθήκευση δημιουργεί ιδιωτικό πρόχειρο. Η δημοσίευση απαιτεί ρητή ενέργεια.
      </p>
      <PredictionForm />
    </div>
  );
}
