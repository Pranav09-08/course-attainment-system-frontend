import { createStore } from "redux";

const initialState = {
  sidebarShow: true, // Sidebar is visible by default
  userRole: null, // Stores the user's role ("admin", "faculty", "coordinator")
};

const changeState = (state = initialState, action) => {
  switch (action.type) {
    case "set":
      return { ...state, sidebarShow: action.sidebarShow };
    case "setRole":
      return { ...state, userRole: action.userRole }; // Store user role
    default:
      return state;
  }
};

const store = createStore(changeState);

export default store;
