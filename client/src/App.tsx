import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
// import BitPredict from "./components/BitPredict";
import "./App.css";

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          <header>
            <h1>Welcome, {user?.username}!</h1>
            <button onClick={signOut}>Sign out</button>
          </header>
          <main>
            Test
            {/* <BitPredict /> */}
          </main>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
