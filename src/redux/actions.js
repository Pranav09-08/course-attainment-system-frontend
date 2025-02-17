// redux/actions.js or redux/actions/userActions.js
export const setUserRole = (role) => {
    return {
      type: "SET_USER_ROLE",
      payload: role,
    };
  };