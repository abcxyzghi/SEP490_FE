import React, { useState } from "react";
import "./CarouselCustom.css";

const CarouselCustom = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel-container">
      <div className="carousel-slide">
        <img
          className="full-image"
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
        />

        <div className="nav left" onClick={goPrev}>❮</div>
        <div className="nav right" onClick={goNext}>❯</div>

        <div className="dots">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`dot ${idx === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselCustom;

