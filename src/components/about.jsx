import React from "react";

export const About = (props) => {
  return (
    <div id="about" className="d-flex justify-content-center align-items-center vh-100">
      <div className="container">
        <div className="row align-items-center">
          {/* Image Section */}
          <div className="col-md-6 text-center">
            <img src="img/about.jpg" className="img-fluid" alt="About" />
          </div>
          
          {/* Text Section */}
          <div className="col-md-6">
            <div className="about-text">
              <h2 className="text-center">About Us</h2>
              <p className="text-center">{props.data ? props.data.paragraph : "Loading..."}</p>
              
              <h3 className="text-center">Why Choose Us?</h3>
              
              <div className="row">
                {/* Left Column - 4 Items */}
                <div className="col-lg-6 col-sm-6">
                  <ul className="list-unstyled">
                    {props.data && props.data.Why.slice(0, 4).map((d, i) => (
                      <li key={`${d}-${i}`} className="text-left">{d}</li>
                    ))}
                  </ul>
                </div>

                {/* Right Column - 4 Items */}
                <div className="col-lg-6 col-sm-6">
                  <ul className="list-unstyled">
                    {props.data && props.data.Why2.slice(0, 4).map((d, i) => (
                      <li key={`${d}-${i}`} className="text-left">{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>  
        </div>
      </div>
    </div>
  );
};
