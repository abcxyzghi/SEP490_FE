import { useEffect } from 'react';
import Swiper from 'swiper';
import { EffectCube, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cube';
import './Carousel.css';

// Import Shop images 
import shopI1 from '../../../assets/shop-carousel/sc_1.png';
import shopI2 from '../../../assets/shop-carousel/sc_2.png';
import shopI3 from '../../../assets/shop-carousel/sc_3.png';

// Initialize Swiper with modules
Swiper.use([EffectCube, Autoplay]);

const ImageCarousel = () => {
  useEffect(() => {
    var swiper = new Swiper('.swiper', {
      effect: 'cube',
      grabCursor: true,
      loop: true,
      speed: 1000,
      cubeEffect: {
        shadow: false,
        slideShadows: true,
        shadowOffset: 10,
        shadowScale: 0.94,
      },
      autoplay: {
        delay: 2600,
        pauseOnMouseEnter: true,
      },
    });

    // Fix for grab cursor behavior on interaction
    // const container = document.querySelector('.swiper');
    // if (container) {
    //   const handleEnter = () => (container.style.cursor = 'grab');
    //   const handleDown = () => (container.style.cursor = 'grabbing');
    //   const handleUp = () => (container.style.cursor = 'grab');

    //   container.addEventListener('mouseenter', handleEnter);
    //   container.addEventListener('mousedown', handleDown);
    //   container.addEventListener('mouseup', handleUp);

    //   return () => {
    //     container.removeEventListener('mouseenter', handleEnter);
    //     container.removeEventListener('mousedown', handleDown);
    //     container.removeEventListener('mouseup', handleUp);
    //   };
    // }
  }, []);

  const shopImages = [shopI1, shopI2, shopI3];

  return (
    <div className="swiper">
      <div className="swiper-wrapper">
        {/* {shopImages.map((src, index) => (
          <div className="swiper-slide" key={index}>
            <img src={src} alt={`Slide ${index}`} />
          </div>
        ))} */}
          <div className="swiper-slide">
            <img src={shopI1} alt={`Slide 1`} />
          </div>
          <div className="swiper-slide">
            <img src={shopI2} alt={`Slide 2`} />
          </div>
          <div className="swiper-slide">
            <img src={shopI3} alt={`Slide 3`} />
          </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
