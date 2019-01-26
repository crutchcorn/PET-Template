import React from "react";
import {AuthContext} from "../core/auth";

export default function Home() {
  return <AuthContext.Consumer>
    {
      ({user}) =>
        <p>{JSON.stringify(user)}</p>
    }
  </AuthContext.Consumer>;
}
