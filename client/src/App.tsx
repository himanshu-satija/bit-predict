import { Authenticator } from "@aws-amplify/ui-react";
import "./app.css";
import BitPredict from "./components/bit-predict";
import BitPredictLogo from "./assets/bit-predict.png";

function App() {
  return (
    <div>
      <img src={BitPredictLogo} alt="BitPredict Logo" className="logo" />
      <BitPredict />
    </div>
  );
}

export default App;
