import React, {Component} from "react";
import {Route,  BrowserRouter as Router, Switch} from "react-router-dom";

import {userState, AuthContext} from "./core/auth";
import PrivateRoute from "./components/ProtectedRoute";
import Home from "./routes/Home";
import Login from "./routes/Login";

// Global CSS goes here
import "./App.css";

class App extends Component {
  state = {
    user: null,
    changeUser: user => {
      this.setState({
        user
      });
    }
  };

  render() {
    return (
      <AuthContext.Provider value={this.state}>
        <Router>
          <Switch>
            <Route path="/login" exact component={Login}/>
            <PrivateRoute path="/" component={Home}/>
          </Switch>
        </Router>
      </AuthContext.Provider>
    );
  }
}

export default App;
