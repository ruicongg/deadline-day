import { ValuationPredictorForm } from "@/components/valuation-predictor-form"

export const metadata = {
  title: "Player Valuation Predictor",
  description: "Predict player market values using machine learning",
}

export default function ValuationPredictorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Player Valuation Predictor</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Upload player statistics to predict market valuations using machine learning
      </p>

      <ValuationPredictorForm />
    </div>
  )
}

