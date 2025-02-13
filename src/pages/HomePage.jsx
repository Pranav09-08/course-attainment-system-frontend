import React, { useState, useEffect } from "react";
import { Navigation } from "../components/navigation";
import { Header } from "../components/header";
import { Features } from "../components/features";
import { About } from "../components/about";
import { Contact } from "../components/contact";
import { Helmet } from "react-helmet";
import JsonData from "../assets/data.json";
import SmoothScroll from "smooth-scroll";
import "../styles/HomePage.css";


export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const HomePage = () => {
  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <div>
      
      <Helmet>
        <title>Course Attainment System</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon" />
        <link rel="stylesheet" type="text/css" href="/fonts/font-awesome/css/font-awesome.css" />
        <link rel="stylesheet" type="text/css" href="/css/style.css" />
      </Helmet>

      <Navigation />
      <Header data={landingPageData.Header} />
      <Features data={landingPageData.Features} />
      <About data={landingPageData.About} />
      <Contact data={landingPageData.Contact} />
    </div>
  );
};

export default HomePage;