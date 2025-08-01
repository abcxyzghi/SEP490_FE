import React, { useState } from "react";
import './Guidebook.css';
import { motion, AnimatePresence } from "framer-motion";
import ChevronLeft from "../../../assets/Icon_line/Chevron_Left.svg";
import ChevronRight from "../../../assets/Icon_line/Chevron_Right.svg";

const Guidebook = ({ isOpen, onClose, steps = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        className="guidebook-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Modal content */}
        <motion.div
          className="guidebook-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Close button */}
          <button className="guidebook-close" onClick={onClose}>
            ⨉
          </button>

          {/* Step content */}
          {steps.length > 0 && (
            <div className="guidebook-content">
              {/* <h2 className="guidebook-title">
                {steps[currentIndex].step}.
              </h2> */}
              <img
                src={steps[currentIndex].image}
                alt={`Step ${steps[currentIndex].step} image`}
                className="guidebook-image"
              />
              <p className="guidebook-description oxanium-regular">
                {steps[currentIndex].description}
              </p>
            </div>
          )}

          {/* Navigation arrows */}
          <div className="guidebook-arrow left">
            <button onClick={prevSlide}>
              <img src={ChevronLeft} alt="Left arrow" />
            </button>
          </div>
          <div className="guidebook-arrow right">
            <button onClick={nextSlide}>
              <img src={ChevronRight} alt="Right arrow" />
            </button>
          </div>

          {/* Pagination dots */}
          <div className="guidebook-dots">
            {steps.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Guidebook;
