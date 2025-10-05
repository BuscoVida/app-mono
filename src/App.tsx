import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import Home from "./views/Home/Home";
import Profile from "./views/Profile/Profile";
import Capture from "./views/Capture/Capture";
import "./App.scss";

function App() {
  return (
    <IonApp style={{ height: "100vh", overflow: "hidden" }}>
      <div className="auth-header">
        <h1>BuscoVida</h1>
      </div>
      <div className="auth-container">
        <Authenticator>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/" component={Home} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/capture" component={Capture} />
            </IonRouterOutlet>
          </IonReactRouter>
        </Authenticator>
      </div>
    </IonApp>
  );
}

export default App;
