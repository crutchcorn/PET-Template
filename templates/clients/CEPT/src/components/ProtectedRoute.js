import React from "react";
import {Redirect, Route} from "react-router-dom";
import {AuthContext} from "../core/auth";

export default function PrivateRoute({ component: Component, ...rest }) {
  return <AuthContext.Consumer>
      {
        ({user}) => <Route {...rest} render={
          (props) => user ? <Component {...props} /> : <Redirect to='/login'/>
        }/>
      }
    </AuthContext.Consumer>
}
