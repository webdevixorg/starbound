import React from 'react';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';

const WarrantyAndReturn: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto my-6">
        <BreadcrumbsComponent />
      </div>

      <div className="prose max-w-3xl my-6">
        <h1>Warranty & Return Policy</h1>
        <p>
          At Logivis Automotive, we are committed to providing high-quality car
          electronics, diagnostic tools, used parts, and automotive accessories.
          Please review our Warranty & Return Policy to understand your rights
          and our process.
        </p>

        <h2>1. Warranty Coverage</h2>
        <p>
          Most of our products come with a limited warranty ranging from 6 to 12
          months depending on the product category:
        </p>
        <ul>
          <li>
            <strong>Diagnostic Tools:</strong> 12-month warranty
          </li>
          <li>
            <strong>Car Electronics & Accessories:</strong> 6-month warranty
          </li>
          <li>
            <strong>Battery-Operated Devices:</strong> 3-month warranty
          </li>
        </ul>
        <p>
          The warranty covers manufacturing defects and hardware malfunctions
          under normal use conditions.
        </p>

        <h2>2. Used Automotive Parts – Check-Only Warranty</h2>
        <p>
          All used car parts are sold with a{' '}
          <strong>check-only warranty</strong>. This means:
        </p>
        <ul>
          <li>
            Parts must be checked and verified as working within{' '}
            <strong>24–48 hours</strong> of delivery or pickup
          </li>
          <li>
            No warranty applies after installation or usage beyond the initial
            check
          </li>
          <li>
            Returns accepted only if the part is non-functional upon initial
            testing
          </li>
        </ul>
        <p>
          We strongly recommend installation by a professional mechanic and
          testing before full integration into the vehicle.
        </p>

        <h2>3. What is Not Covered</h2>
        <p>The following are excluded from warranty coverage:</p>
        <ul>
          <li>Physical damage due to mishandling or accidents</li>
          <li>Damage caused by incorrect installation or wiring</li>
          <li>Water damage or corrosion</li>
          <li>Products tampered with or repaired by unauthorized personnel</li>
          <li>Consumables such as cables, adapters, or fuses</li>
        </ul>

        <h2>4. Warranty Claim Procedure</h2>
        <p>
          To submit a claim, email{' '}
          <a href="mailto:support@logivis.com">support@logivis.com</a> with:
        </p>
        <ul>
          <li>Your order ID and purchase receipt</li>
          <li>Product serial number (if applicable)</li>
          <li>Photos or video showing the defect</li>
        </ul>
        <p>
          Upon verification, we will arrange for pickup, replacement, or repair
          depending on product condition and availability.
        </p>

        <h2>5. Return Policy</h2>
        <p>
          Returns are accepted within <strong>7 days</strong> of delivery for:
        </p>
        <ul>
          <li>
            Products in original condition, unused and with original packaging
          </li>
          <li>Wrong item delivered</li>
          <li>Dead-on-arrival (DOA) products</li>
        </ul>
        <p>
          Used parts are only returnable if found non-functional during initial
          testing (within 48 hours). A restocking fee of 10% may apply for
          non-defective returns. Shipping charges are non-refundable.
        </p>

        <h2>6. Refund & Replacement</h2>
        <p>
          Once your return is inspected, we’ll notify you by email. If approved,
          your refund will be processed to your original payment method within
          5–7 business days. In case of replacements, shipping of the new item
          will be initiated promptly.
        </p>

        <h2>7. Installation Responsibility</h2>
        <p>
          Certain products (e.g., reverse cameras, Android players) must be
          installed by qualified technicians. Warranty is void if damage results
          from improper installation.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          If you need help with warranty or return procedures, please contact
          our support team at{' '}
          <a href="mailto:info@logivis.com">info@logivis.com</a> or call us at
          +94-77 3700 121.
        </p>
      </div>
    </div>
  );
};

export default WarrantyAndReturn;
