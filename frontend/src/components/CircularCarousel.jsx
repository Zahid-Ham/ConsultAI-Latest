import React, { useState, useRef, useEffect } from 'react';
import FontAwesome from './FontAwesome.jsx';

const features = [
  { id: 1, title: 'AI Chatbot', description: '24/7 intelligent support for patients and doctors, streamlining communication and providing immediate answers.', link: '#' },
  { id: 2, title: 'Secure Messaging', description: 'A robust, encrypted communication platform for manual, secure exchange of sensitive information.', link: '#' },
  { id: 3, title: 'Data Analytics', description: 'Leverage AI to analyze patient data, providing actionable insights for personalized care and treatment.', link: '#' },
  { id: 4, title: 'Appointment Scheduling', description: 'An intelligent system that simplifies booking appointments, sending reminders, and managing schedules.', link: '#' },
  { id: 5, title: 'Remote Monitoring', description: 'Use connected devices to remotely monitor patient health, with AI alerts for critical changes.', link: '#' },
  { id: 6, title: 'E-Prescriptions', description: 'AI-powered electronic prescription management for a seamless and secure medication process.', link: '#' },
];

const CircularCarousel = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const carouselRef = useRef(null);

  const totalCards = features.length;
  const rotationAngle = 360 / totalCards;
  const carouselRotation = -currentCardIndex * rotationAngle;
  const radius = 200;

  const handleNext = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % totalCards);
  };

  const handlePrevious = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + totalCards) % totalCards);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || (e.touches && e.touches[0].clientX));
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX);
    const deltaX = currentX - startX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCardIndex]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          Welcome to <span className="text-blue-500">AI Consult</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
          Explore the future of healthcare through our innovative features, powered by artificial intelligence.
        </p>
      </div>

      <div
        className="relative w-full max-w-4xl mx-auto flex items-center justify-center"
        style={{ perspective: '1000px', height: '400px' }}
      >
        <div
          ref={carouselRef}
          className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${carouselRotation}deg)`,
            transition: 'transform 0.8s ease-in-out',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          {features.map((feature, index) => {
            const angle = index * rotationAngle;
            return (
              <div
                key={feature.id}
                className="absolute flex flex-col items-center justify-center bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 text-center border border-gray-700 transition-transform duration-500 ease-in-out cursor-pointer"
                style={{
                  width: '250px',
                  height: '350px',
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-125px',
                  marginTop: '-175px',
                  opacity: Math.abs(index - currentCardIndex) < 2 || Math.abs(index - currentCardIndex) > totalCards - 2 ? 1 : 0.4,
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-blue-400">{feature.title}</h3>
                  <p className="text-gray-300 text-sm sm:text-base mt-2">{feature.description}</p>
                </div>
                <a
                  href={feature.link}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors duration-300 rounded-full text-white font-semibold shadow-lg transform hover:scale-105"
                >
                  Learn More
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex space-x-4">
        <button
          onClick={handlePrevious}
          className="p-4 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
          aria-label="Previous card"
        >
          <FontAwesome iconName="FaChevronLeft" size={24} />
        </button>
        <button
          onClick={handleNext}
          className="p-4 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
          aria-label="Next card"
        >
          <FontAwesome iconName="FaChevronRight" size={24} />
        </button>
      </div>
    </div>
  );
};

export default CircularCarousel;
