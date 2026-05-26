'use client';

import React, { useState } from 'react';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribed:', email);
    setEmail('');
    alert('Thank you for subscribing!');
  };

  return (
    <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-red-600 rounded-full opacity-10 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">
            Join the <span className="text-red-500">Starbound</span> Community
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Get exclusive offers, automotive news, and expert tips delivered
            straight to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-6 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-10 py-4 bg-red-600 hover:bg-white hover:text-black text-white font-bold uppercase tracking-widest rounded-lg transition-all duration-300 shadow-xl"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
