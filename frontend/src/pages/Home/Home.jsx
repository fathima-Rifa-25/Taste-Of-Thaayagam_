import { useState } from "react";
import HeaderHome from "../../components/HeaderHome/HeaderHome";
import TopPicks from "../../components/TopPicks/TopPicks";
import "./Home.css";
import Hero2 from "../../components/Hero2/Hero2";
import Hero3 from "../../components/Hero3/Hero3";
import ReservationProcess from "../../components/ReservationProcess/ReservationProcess";
import Testimonials from "../../components/Testimonials/Testimonials";
import FAQ from "../../components/FAQ/FAQ";
import MiniCartButton from "../../components/MiniCartButton/MiniCartButton";

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <>
      <HeaderHome />
      {/* Two-column info section */}
      <section className="home-info-panels">
        <div className="home-info-panel">
          <h3>Come Explore With US !</h3>
          <p>
            Choose from our diverse menu featuring a delectable array of
            dishes.Our mission is to satisfy your craving and elevate your
            dinning experience
          </p>
        </div>
        <div className="home-info-panel">
          <h3>Know About Your Taste Buds!</h3>
          <p>
            Choose from our diverse menu featuring a delectable array of
            dishes.Our mission is to satisfy your craving and elevate your
            dinning experience
          </p>
        </div>
      </section>
      <Hero2 />

      <TopPicks />
      <ReservationProcess />
      <Hero3 />

      <Testimonials />
      <FAQ />

      <MiniCartButton />
    </>
  );
};

export default Home;
