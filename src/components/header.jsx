import React from "react";

export const Header = (props) => {
  return (
    <header id="header">
  <div className="intro d-flex justify-content-center align-items-center vh-100">
    {/* <div className="overlay w-100"> */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <h1>{props.data ? props.data.title : "Loading"}</h1>
            <p>{props.data ? props.data.paragraph : "Loading"}</p>
            <a href="#features" className="btn btn-custom btn-lg page-scroll">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  {/* </div> */}
</header>

  );
};
