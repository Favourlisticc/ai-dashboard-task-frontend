import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const useAnimation = (animationFn, dependencies = []) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      animationFn(elementRef.current);
    }
  }, dependencies);

  return elementRef;
};

export const useStaggerAnimation = (animationFn, itemCount, dependencies = []) => {
  const elementRefs = useRef([]);
  
  useEffect(() => {
    if (elementRefs.current.length === itemCount) {
      animationFn(elementRefs.current);
    }
  }, dependencies);

  const setRef = (index) => (el) => {
    elementRefs.current[index] = el;
  };

  return setRef;
};