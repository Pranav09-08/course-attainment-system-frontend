import React from "react";

export const Features = (props) => {
  return (
    <div id="features" className="text-center d-flex justify-content-center align-items-center vh-50">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 section-title">
            <h2>Features</h2>
          </div>
        </div>
        <div className="row d-flex justify-content-center">
          {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.title}-${i}`} className="col-xs-6 col-md-3 text-center">
                  <i className={d.icon}></i>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              ))
            : "Loading..."}
        </div>
      </div>
    </div>
  );
};
