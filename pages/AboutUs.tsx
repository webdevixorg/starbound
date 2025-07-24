// pages/about.tsx or about-us.tsx
import React from 'react';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';

const AboutUs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto my-6">
        <BreadcrumbsComponent />
      </div>

      <div className="prose max-w-3xl my-6">
        <h2>Who We Are</h2>
        <p>
          Founded on February 28, 2024, Logivis Automotive was born from a
          genuine passion to elevate vehicle care in Sri Lanka. Our mission is
          to revolutionize the automotive service experience through tailored
          solutions grounded in precision, reliability, and customer
          satisfaction. We strive to empower our clients with essential
          knowledge, becoming their trusted partner in vehicle ownership. Our
          vision is to be Sri Lanka’s leading automotive service
          provider—renowned for excellence, innovation, and a relentless
          commitment to raising service standards and building lasting
          relationships. While we currently focus on online sales, we are
          actively working toward opening a physical repair center and store to
          meet the growing needs of our customers.
        </p>
        <h2>What We Offer</h2>
        <ul>
          <li>
            <strong>Spare Parts:</strong> Genuine, high-quality parts for cars
            and vans.
          </li>
          <li>
            <strong>Repair Services:</strong> Diagnostics, maintenance, and
            repair solutions for all models.
          </li>
          <li>
            <strong>Vehicle Optimization:</strong> Performance upgrades and
            engine tuning.
          </li>
          <li>
            <strong>EV Charging:</strong> Future-ready charging stations for
            electric vehicles.
          </li>
          <li>
            <strong>Detailing:</strong> Interior & exterior detailing with
            advanced paint protection.
          </li>
          <li>
            <strong>Tire Care:</strong> Installation, alignment, balancing, and
            repairs.
          </li>
          <li>
            <strong>Consultations:</strong> Expert advice tailored to each
            customer’s needs.
          </li>
          <li>
            <strong>Education:</strong> Empowering users with car care knowledge
            through digital content.
          </li>
        </ul>
        <h2>Our Future Goals</h2>
        <ul>
          <li>Expand into physical service centers.</li>
          <li>Launch workshops and community outreach programs.</li>
          <li>
            Introduce new services aligned with future vehicle technologies.
          </li>
        </ul>
        <h2>Addressing Sri Lanka’s Automotive Challenges</h2>
        <p>
          Logivis Automotive is more than a service provider—we are a problem
          solver:
        </p>
        <ul>
          <li>
            <strong>Efficient Services:</strong> Streamlined processes to reduce
            wait times and improve satisfaction.
          </li>
          <li>
            <strong>Trusted Repairs:</strong> Reliable, transparent service from
            trained professionals.
          </li>
          <li>
            <strong>Genuine Parts:</strong> Only authentic components to ensure
            vehicle safety and longevity.
          </li>
          <li>
            <strong>Sustainability:</strong> EV support and eco-conscious
            practices.
          </li>
          <li>
            <strong>Workforce Development:</strong> Training the next generation
            of expert mechanics and technicians.
          </li>
        </ul>
        <p>
          At Logivis, we aim to transform the vehicle service industry in Sri
          Lanka through excellence, innovation, and customer-first thinking.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
