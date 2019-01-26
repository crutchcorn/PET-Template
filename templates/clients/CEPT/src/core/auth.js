import React from "react";

export const AuthContext = React.createContext({
  user: null,
  changeUser: () => {}
});

export const userState = {
  user: null,
  changeUser
};

function changeUser(user) {
  this.setState({
    user
  });
}
