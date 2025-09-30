import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { Check, Crown, Zap, Star, Users } from 'lucide-react';

const Pricing = () => {
  useEffect(() => {
    gsap.fromTo('.pricing-card', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out' }
    );
  }, []);

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out our AI assistant",
      icon: Users,
      features: [
        "3 messages per day",
        "Basic Chelsea FC information",
        "General frontend development tips",
        "Standard response speed",
        "Community support"
      ],
      buttonText: "Get Started",
      popular: false,
      gradient: "from-gray-400 to-gray-600"
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "Best for regular users and developers",
      icon: Zap,
      features: [
        "Unlimited messages",
        "Detailed Chelsea FC analysis",
        "Advanced frontend coding help",
        "Faster response times",
        "Priority support",
        "Chat history saving",
        "Early access to features"
      ],
      buttonText: "Start Free Trial",
      popular: true,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "Enterprise",
      price: "$29.99",
      period: "/month",
      description: "For power users and teams",
      icon: Crown,
      features: [
        "Everything in Pro",
        "Team collaboration features",
        "Custom AI model training",
        "API access",
        "Dedicated account manager",
        "Custom integration support",
        "99.9% uptime guarantee"
      ],
      buttonText: "Contact Sales",
      popular: false,
      gradient: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-10">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get unlimited access to our specialized AI assistant for Chelsea FC and frontend development
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`pricing-card relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                plan.popular 
                  ? 'border-blue-500 transform scale-105' 
                  : 'border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">The Pro plan comes with a 7-day free trial. No credit card required to start.</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-2">What AI model do you use?</h3>
              <p className="text-gray-600">We use DeepSeek's advanced language model, specially trained on Chelsea FC and frontend development content.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;