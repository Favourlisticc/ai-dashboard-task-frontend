import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { heroAnimation, staggerAnimation, textReveal, floatingAnimation } from '../animations/gsapAnimations';
import { MessageSquare, BarChart3, Zap, ArrowRight, Shield, Code } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const featuresRef = useRef([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Hero animation
    heroAnimation(heroRef.current, textRef.current, buttonRef.current);

    // Features animation
    if (featuresRef.current.length > 0) {
      staggerAnimation(featuresRef.current);
    }

    // Section text reveal
    if (sectionRef.current) {
      textReveal(sectionRef.current);
    }

    // Floating elements
    const floatingElements = document.querySelectorAll('.floating');
    floatingElements.forEach(el => floatingAnimation(el));
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Chelsea FC Expert",
      description: "Ask me anything about Chelsea Football Club - matches, players, history, and stats",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Code,
      title: "Frontend Development",
      description: "Get help with React, JavaScript, Tailwind CSS, and modern web development",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Focused & Specialized",
      description: "I only answer questions about Chelsea FC and frontend development topics",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <>
      <Navbar/>
      <div className="min-h-screen max-sm:pt-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
          </div>

          <div ref={heroRef} className="container mx-auto px-6 text-center relative z-10">
            <div ref={textRef} className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Specialized AI Assistant
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-4 leading-relaxed">
                Your expert AI for <span className="font-semibold text-blue-600">Chelsea FC</span> and <span className="font-semibold text-purple-600">Frontend Development</span>
              </p>
              <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto">
                I'm a specialized assistant focused exclusively on Chelsea Football Club and frontend development technologies. 
                Ask me about matches, players, React, JavaScript, or web development - but please note I only answer questions within these two domains.
              </p>
              <div ref={buttonRef} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/chat" 
                  className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Start Chatting</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/dashboard" 
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div ref={sectionRef} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                What I Can Help You With
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                I specialize in these two domains and provide expert knowledge in both areas
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  ref={el => featuresRef.current[index] = el}
                  className="group p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-white/40"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 floating`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialization Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                Focused Expertise
              </h3>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <p className="text-lg text-gray-700 mb-4">
                  <span className="font-semibold text-blue-600">Important:</span> I am programmed to only answer questions about:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <h4 className="font-bold text-blue-800 text-lg mb-2">🏆 Chelsea FC</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Match results & analysis</li>
                      <li>• Player statistics & profiles</li>
                      <li>• Club history & achievements</li>
                      <li>• Transfer news & rumors</li>
                      <li>• Tactics & formations</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                    <h4 className="font-bold text-purple-800 text-lg mb-2">💻 Frontend Development</h4>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• React.js & JavaScript</li>
                      <li>• Tailwind CSS & styling</li>
                      <li>• GSAP animations</li>
                      <li>• Web development best practices</li>
                      <li>• Code troubleshooting</li>
                    </ul>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  For questions outside these topics, I'll politely let you know about my specialization boundaries.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h3 className="text-4xl font-bold text-gray-800 mb-6">
              Ready to Chat?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start a conversation about Chelsea FC or frontend development and experience specialized AI assistance.
            </p>
            <Link 
              to="/chat" 
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Start Specialized Chat</span>
            </Link>
          </div>
        </section>
      </div>
     
    </>
  );
};

export default Home;