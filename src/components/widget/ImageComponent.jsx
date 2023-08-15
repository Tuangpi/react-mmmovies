import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function ImageComponent({ src, className, alt }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      setIsLoading(false);
    };
    image.onerror = () => {
      setIsLoading(false);
    };
  }, [src]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <img src={src} alt={alt} className={className} />
    </motion.div>
  );
}
export default ImageComponent;
