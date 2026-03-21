import { useState } from "react";
import OnboardingForm from "./components/OnboardingForm";
import ResultScreen from "./components/ResultScreen";
import SimulationScreen from "./components/SimulationScreen";
import type { PredictionResponse } from "./types/prediction";

type Screen = "onboarding" | "result" | "simulation";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("onboarding");
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);

  const handlePredictionSuccess = (data: PredictionResponse) => {
    setPredictionData(data);
    setCurrentScreen("result");
  };

  const handleViewEvolution = () => {
    setCurrentScreen("simulation");
  };

  const handleBackToResults = () => {
    setCurrentScreen("result");
  };

  const handleRunAgain = () => {
    setPredictionData(null);
    setCurrentScreen("onboarding");
  };

  switch (currentScreen) {
    case "onboarding":
      return <OnboardingForm onPredictionSuccess={handlePredictionSuccess} />;
    case "result":
      return (
        <ResultScreen
          data={predictionData}
          onViewEvolution={handleViewEvolution}
          onBack={handleRunAgain}
        />
      );
    case "simulation":
      return (
        <SimulationScreen
          data={predictionData}
          onBack={handleBackToResults}
          onRunAgain={handleRunAgain}
        />
      );
    default:
      return <OnboardingForm onPredictionSuccess={handlePredictionSuccess} />;
  }
}

export default App;
