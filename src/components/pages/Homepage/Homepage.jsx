import React, { useRef } from 'react';
import './Homepage.css';
import { motion, useInView } from 'framer-motion';
import AnimatedSection from '../../instants/AnimatedSection';
import ParallaxTitle from '../../instants/ParallaxTitle';
import FancyCarousel from '../../libs/FancyCarousel/FancyCarousel';
// import comic
import ComicOP from '../../../assets/homeGallery/comic/One piece comic bg.png';
import ComicDDD from '../../../assets/homeGallery/comic/Dandadan comic bg.png';
import ComicTG from '../../../assets/homeGallery/comic/Tokyo Ghoul bg.jpg';
import ComicCM from '../../../assets/homeGallery/comic/Chainsaw man comic bg.jpg';
// import box
import BoxTG from '../../../assets/homeGallery/boxes/TokyoGhoul_Boxset.png';
import BoxSxF from '../../../assets/homeGallery/boxes/SpyxFamily_Boxset.png';
import BoxDDD from '../../../assets/homeGallery/boxes/Dandadan_Boxset.png';
import BoxB from '../../../assets/homeGallery/boxes/Bleach_Boxset.png';
import BoxAOT from '../../../assets/homeGallery/boxes/AttackOnTitan_Boxset.png';
// import cards & chars
import CardEL from '../../../assets/homeGallery/cards/Qcard.png';
import CardToChar from '../../../assets/homeGallery/cards/cardToChar.png';
// import char cards
import CardChar1 from '../../../assets/homeGallery/cardNchars/Group 2056.png';
import CardChar2 from '../../../assets/homeGallery/cardNchars/Group 193.png';
import CardChar3 from '../../../assets/homeGallery/cardNchars/Group 95.png';
import CardChar4 from '../../../assets/homeGallery/cardNchars/Uncommon Card.png';
import CardChar5 from '../../../assets/homeGallery/cardNchars/Group 537.png';
import CardChar6 from '../../../assets/homeGallery/cardNchars/Group 566.png';
import CardChar7 from '../../../assets/homeGallery/cardNchars/Group 655.png';
import CardChar8 from '../../../assets/homeGallery/cardNchars/Group 288.png';
import CardChar9 from '../../../assets/homeGallery/cardNchars/Common Card.png';

import CardChar10 from '../../../assets/homeGallery/cardNchars/Group 40.png';
import CardChar11 from '../../../assets/homeGallery/cardNchars/Rare Card.png';
import CardChar12 from '../../../assets/homeGallery/cardNchars/Group 68.png';
import CardChar13 from '../../../assets/homeGallery/cardNchars/Group 479.png';
import CardChar14 from '../../../assets/homeGallery/cardNchars/Epic Card.png';
import CardChar15 from '../../../assets/homeGallery/cardNchars/Group 257.png';
import CardChar16 from '../../../assets/homeGallery/cardNchars/Group 501.png';
import CardChar17 from '../../../assets/homeGallery/cardNchars/Group 200.png';
import CardChar18 from '../../../assets/homeGallery/cardNchars/Group 810.png';


export default function Homepage() {
  const comicImages = [ComicOP, ComicDDD, ComicTG, ComicCM];
  const boxImages = [BoxAOT, BoxB, BoxDDD, BoxSxF, BoxTG];
  const topRowCards = [
    CardChar1, CardChar2, CardChar3, CardChar4, CardChar5,
    CardChar6, CardChar7, CardChar8, CardChar9,
  ];

  const bottomRowCards = [
    CardChar10, CardChar11, CardChar12, CardChar13, CardChar14,
    CardChar15, CardChar16, CardChar17, CardChar18,
  ];

  const comicLeftRef = useRef();
  const comicRightRef = useRef();
  const boxLeftRef = useRef();
  const boxRightRef = useRef();
  const cardLeftRef = useRef();
  const cardRightRef = useRef();

  const comicLeftInView = useInView(comicLeftRef, { once: false });
  const comicRightInView = useInView(comicRightRef, { once: false });
  const boxLeftInView = useInView(boxLeftRef, { once: false });
  const boxRightInView = useInView(boxRightRef, { once: false });
  const cardLeftInView = useInView(cardLeftRef, { once: false });
  const cardRightInView = useInView(cardRightRef, { once: false });

  return (
    <div className='homepage-container  '>
      {/* Carousel section*/}
      <FancyCarousel />

      <div className='homepage-content'>
        {/* Comic section */}
        <div className='homepage-comic-container'>
          <motion.div
            className='homepage-comic-left'
            ref={comicLeftRef}
            initial={{ opacity: 0, y: 80 }}
            animate={comicLeftInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
            transition={{ duration: 0.8 }}
          // viewport={{ once: true, amount: 0.4 }}
          >
            <div className='homepage-comic-title oleo-script-bold'>
              <h2>Characters from your favorite Manga</h2>
            </div>
            <div className='homepage-comic-description oxanium-regular'>
              <p>Explore a gallery of the most beloved characters in manga history, immortalized through premium artwork and timeless design.<br />
                This collection is crafted for collectors and fans who appreciate the artistry, narrative depth, and cultural impact of manga worldwide.</p>
            </div>
          </motion.div>

          <motion.div
            className='homepage-comic-right'
            ref={comicRightRef}
            initial={{ opacity: 0, y: 80 }}
            animate={comicRightInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          // viewport={{ once: true, amount: 0.4 }}
          >
            <div className='homepage-comic-card-wrapper'>
              {comicImages.map((comic, index) => (
                <div key={index} className={`homepage-comic-card homepage-comic-card-${index + 1} `}>
                  <img src={comic} alt={`homepage-comic-${index + 1}`} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>


        {/* Box section */}
        <div className='homepage-box-container'>
          <motion.div
            className='homepage-box-left'
            ref={boxLeftRef}
            initial={{ opacity: 0, x: -60 }}
            animate={boxLeftInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className='homepage-box-card-wrapper'>
              {boxImages.map((box, index) => (
                <div key={index} className={`homepage-box-card homepage-box-card-${index + 1} `}>
                  <img src={box} alt={`box-${index + 1}`} />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className='homepage-box-right'
            ref={boxRightRef}
            initial={{ opacity: 0, x: 60 }}
            animate={boxRightInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className='homepage-box-title oleo-script-bold'>
              <h2>Boxes waited to be discovered</h2>
            </div>
            <div className='homepage-box-description oxanium-regular'>
              <p>Every box is a limited-edition release featuring handpicked content: from out-of-print manga to collectible items and hidden gems.<br />
                Whether you're growing your shelf or searching for the next rare find, our mystery boxes are crafted with care, quality, and passion.</p>
            </div>
          </motion.div>
        </div>


        {/* Card section */}
        <div className='homepage-card-container'>
          <motion.div
            className='homepage-card-left'
            ref={cardLeftRef}
            initial={{ opacity: 0, y: 60 }}
            animate={cardLeftInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
            transition={{ duration: 0.8 }}
          // viewport={{ once: true, amount: 0.4 }}
          >
            <div className='homepage-card-title oleo-script-bold'>
              <h2>Bet your luck on most beloved Legendary</h2>
            </div>
            <div className='homepage-card-description oxanium-regular'>
              <p>Hidden behind every card is a potential treasure - rare character editions, holographic prints, or limited-run designs that few ever get their hands on. <br />
                Each pull is an opportunity to uncover something truly legendary.
                Meticulously printed and securely sealed, our cards are crafted for serious collectors who seek the thrill of rarity and the joy of discovery.</p>
            </div>
          </motion.div>

          <motion.div
            className='homepage-card-right'
            ref={cardRightRef}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={cardRightInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className="homepage-card-hover-wrapper">
              <img src={CardEL} alt="Main Card" className="homepage-card-base" />
              <img src={CardToChar} alt="Character Reveal" className="homepage-card-reveal" />
            </div>
          </motion.div>
        </div>

        {/* Cards carousel section */}
        <div className="homepage-cardSlider-container">
          <div className="homepage-cardWrapper">
            <motion.div
              className="homepage-cardWrapper-top"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
            >
              {[...topRowCards, ...topRowCards].map((src, index) => (
                <img src={src} alt={`card-${index}`} key={`top-${index}`} className="card-slide-img" />
              ))}
            </motion.div>

            <motion.div
              className="homepage-cardWrapper-bot"
              animate={{ x: ['-50%', '0%'] }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
            >
              {[...bottomRowCards, ...bottomRowCards].map((src, index) => (
                <img src={src} alt={`card-${index}`} key={`bot-${index}`} className="card-slide-img" />
              ))}
            </motion.div>
          </div>

          <div className='homepage-cardSlider-title oleo-script-bold text-5xl sm:text-6xl md:text-7xl lg:text-[103px] xl:text-[118px]'>
            <ParallaxTitle>
              <h2>
                Obtain <br />
                - <br />
                Build your collections
              </h2>
            </ParallaxTitle>
          </div>
        </div>
      </div>

    </div>
  )
}
