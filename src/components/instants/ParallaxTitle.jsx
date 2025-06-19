import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function ParallaxTitle({ children }) {
  const ref = useRef();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]); // adjust range as needed

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="homepage-cardSlider-title absolute z-10 text-center left-1/2 -translate-x-1/2"
    >
      {children}
    </motion.div>
  );
}
