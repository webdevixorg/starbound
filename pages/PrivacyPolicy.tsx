import React from 'react';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto my-6">
        <BreadcrumbsComponent />
      </div>

      <div className="prose max-w-3xl">
        <h1>Privacy Policy</h1>
        <p>
          At Logivis.com, we are committed to protecting your personal
          information and your right to privacy. If you have any questions or
          concerns about this privacy notice or our practices with regard to
          your personal information, please contact us.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We collect personal information that you voluntarily provide to us
          when registering on the website, expressing an interest in obtaining
          information about us or our products and services, or otherwise
          contacting us.
        </p>

        <h2>How We Use Your Information</h2>
        <p>
          We use personal information collected via our website for a variety of
          business purposes described below:
        </p>
        <ul>
          <li>To facilitate account creation and login process.</li>
          <li>To send administrative information to you.</li>
          <li>To protect our services and ensure safety.</li>
        </ul>

        <h2>Sharing Your Information</h2>
        <p>
          We do not share your personal information with third parties without
          your consent, except as required by law or to provide you with
          services.
        </p>

        <h2>Cookies and Tracking</h2>
        <p>
          We may use cookies and similar tracking technologies to access or
          store information.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions or comments about this policy, you may contact
          us at: info@logivis.com
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
