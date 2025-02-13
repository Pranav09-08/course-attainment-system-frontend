import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Import Redux Provider
import store from "./store"; // Import your Redux store
import App from "./App";
import $ from "jquery";
import "bootstrap";

// ✅ Attach jQuery to window (for Bootstrap to detect it)
window.$ = window.jQuery = $;

console.log("✅ jQuery Loaded:", $.fn.jquery);


ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App /> 
    </BrowserRouter>
  </Provider>
);
