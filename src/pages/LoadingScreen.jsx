import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const LoadingScreen = ({ onLoadingComplete }) => {
  const [slideDown, setSlideDown] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [logoMoveRight, setLogoMoveRight] = useState(false);

  useEffect(() => {
    // Step 1: Slide down from the top
    setTimeout(() => {
      setSlideDown(true);
    }, 100); // Delay before sliding down

    // Step 2: Show the BUGBEE logo
    setTimeout(() => {
      setLogoVisible(true);
    }, 500); // Delay before showing the logo

    // Step 4: Slide up and disappear
    setTimeout(() => {
      setSlideDown(false);
      // Call the onLoadingComplete callback after the animation
      setTimeout(() => {
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, 500); // Match this duration with the CSS transition duration
    }, 2500); // Delay before sliding up and disappearing
  }, [onLoadingComplete]);

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen bg-black flex items-center justify-center z-50 transition-all duration-500 ${
        slideDown ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className={`text-white text-4xl font-bold transition-all duration-500 ${
          logoVisible ? "opacity-100" : "opacity-0"
        } `}
      >
        <Link to="/">
          <img
            className="w-[200px] h-[200px] md:w-[400px] md:h-[400px]"
            src="https://res.cloudinary.com/vanshstorage/image/upload/v1738212405/12200605_sbzf8a.svg"
            alt="BUGBEE Logo"
          />
        </Link>
      </div>
    </div>
  );
};

export default LoadingScreen;
