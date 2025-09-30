import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Hero animations
export const heroAnimation = (heroRef, textRef, buttonRef) => {
  const tl = gsap.timeline();
  
  tl.fromTo(heroRef, 
    { opacity: 0, scale: 1.1 },
    { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
  )
  .fromTo(textRef, 
    { y: 100, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" },
    "-=0.5"
  )
  .fromTo(buttonRef, 
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.8)" },
    "-=0.3"
  );
};

// Stagger animation for features
export const staggerAnimation = (elements, delay = 0.2) => {
  gsap.fromTo(elements, 
    { 
      y: 60, 
      opacity: 0,
      scale: 0.8
    },
    { 
      y: 0, 
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: delay,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: elements[0].parentNode,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    }
  );
};

// Text reveal animation
export const textReveal = (element) => {
  gsap.fromTo(element, 
    {
      y: 100,
      opacity: 0,
      rotationX: 90
    },
    {
      y: 0,
      opacity: 1,
      rotationX: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    }
  );
};

// Floating animation
export const floatingAnimation = (element) => {
  gsap.to(element, {
    y: -20,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
};

// Page transition
export const pageTransition = (element) => {
  gsap.fromTo(element, 
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
  );
};