import {UserActions, UserActionTypes} from './user.actions';
import {User} from './user';

export interface State {
  user: User;
}

const initialState: State = {
  user: null
};

export function reducer(state: State = initialState,
                        action: UserActions): State {
  switch (action.type) {
    case UserActionTypes.LoadUser:
      return Object.assign({}, state, {
        user: action.payload,
      });

    case UserActionTypes.UnloadUser:
      return {
        user: null,
      };

    default:
      return state;
  }
}

export const getUser = (state: State) => state.user;
