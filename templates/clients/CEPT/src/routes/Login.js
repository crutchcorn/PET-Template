import React, {Component} from "react";
import {AuthContext} from "../core/auth";
import {Redirect} from "react-router-dom";

class Login extends Component {
  render() {
    return <div/>
  }
}

export default class LoginParent extends Component {
  render() {
    return <AuthContext.Consumer>
      {
        ({user, changeUser}) =>
          user ?
            <Redirect to="/"/> :
            <Login changeUserFunc={changeUser}/>
      }
    </AuthContext.Consumer>
  }
}
