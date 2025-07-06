import { useEffect, useState } from 'react';
import Swiper from 'swiper/bundle';
import Tilt from 'react-parallax-tilt';
// import { EffectCube, Autoplay } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/effect-cube';
import 'swiper/css/bundle'; // includes all styles
import './FancyCarousel.css';

// import Home images 
import homeAOT from '../../../assets/carousel/attack-on-titan-s4.png';
import homeDDD from '../../../assets/carousel/dandadan.png';
import homeDS from '../../../assets/carousel/demon-slayer.jpg';
import homeOP from '../../../assets/carousel/one-piece-arc-wano.png';
import homeN from '../../../assets/carousel/WallpaperDog-20373483.jpg';

// import Home replace images 
import homeR_AOT from '../../../assets/carousel/attack-on-titan.jpg';
import homeR_DDD from '../../../assets/carousel/granny_turbo.jpg';
import homeR_DS from '../../../assets/carousel/fiery_warrior.jpeg';
import homeR_OP from '../../../assets/carousel/Kaido_Mooon.jpg';
import homeR_N from '../../../assets/carousel/naruto-kurama-versus-sasuke-suppress-beast.jpg';

// import Home Char images 
import homechAOT from '../../../assets/carousel/eren_yeager.png';
import homechDDD from '../../../assets/carousel/ken_takakura.png';
import homechDS from '../../../assets/carousel/tanjiro_kamado.png';
import homechOP from '../../../assets/carousel/luffy_gear5_gigant.png';
import homechN from '../../../assets/carousel/uzumaki_naruto.png';


const slides = [
    { defaultImg: homeAOT, hoverImg: homeR_AOT, charImg: homechAOT },
    { defaultImg: homeDDD, hoverImg: homeR_DDD, charImg: homechDDD },
    { defaultImg: homeDS, hoverImg: homeR_DS, charImg: homechDS },
    { defaultImg: homeOP, hoverImg: homeR_OP, charImg: homechOP },
    { defaultImg: homeN, hoverImg: homeR_N, charImg: homechN },
];

const FancyCarousel = () => {
    useEffect(() => {
        new Swiper('.fancy-swiper', {
            loop: true,
            speed: 1200,
            grabCursor: true,
            autoplay: {
                delay: 5000,
                pauseOnMouseEnter: false,
            },
        });
    }, []);

    return (
        <div className="swiper fancy-swiper fancy-flow">
            <div className="swiper-wrapper fancy-flow">
                {slides.map((slide, index) => (
                    <div className="swiper-slide fancy-slide fancy-flow" key={index}>
                        <HoverCard {...slide} />
                    </div>
                ))}
            </div>
        </div>
    );
};


const HoverCard = ({ defaultImg, hoverImg, charImg }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="carousel-hover-card"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <img src={hovered ? hoverImg : defaultImg} alt="main" className="carousel-mainbg-img" />
            {hovered && (
                <Tilt className="char-wrapper"
                    tiltMaxAngleX={15} //maximum tilt range on X and Y axes (0–90)
                    tiltMaxAngleY={15}
                    perspective={500} //Sets how "deep" the tilt looks (Smaller number → more intense tilt)
                    scale={1.05} //Scales the entire component on hover (default: 1)
                    glareEnable={false} //Enables a light reflection glare on hover
                    glareMaxOpacity={0.45} //Controls how strong the glare is (0 = none, 1 = full)
                    trackOnWindow={true} //Tracks the mouse globally (not just inside component)
                    gyroscope={true}  // mobile tilt support
                >
                    <img src={charImg} alt="character" className="char-img" />
                </Tilt>
            )}
        </div>
    );
};

export default FancyCarousel;
