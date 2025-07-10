import React from 'react';
import BreadcrumbsComponent from '../components/Common/Breadcrumbs';

const TermsOfUse: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto my-6">
        <BreadcrumbsComponent />
      </div>

      <div className="prose max-w-3xl my-6">
        <h1>Terms of Use</h1>
        <p>
          Welcome to logivis.com. These Terms of Use govern your use of our
          website and services. By accessing or using our services, you agree to
          comply with and be bound by these terms.
        </p>

        <h2>1. Use of the Site</h2>
        <p>
          You agree to use the site for lawful purposes only. You must not use
          the site in any way that breaches any applicable local, national, or
          international law.
        </p>

        <h2>2. Intellectual Property</h2>
        <p>
          All content on this site including text, images, logos, and graphics
          are the property of logivis.com and are protected by copyright laws.
        </p>

        <h2>3. User Content</h2>
        <p>
          By submitting content to our site, you grant us the right to use,
          reproduce, modify, and distribute such content in any format and on
          any platform.
        </p>

        <h2>4. Disclaimers</h2>
        <p>
          The website and its content are provided on an “as is” basis. We make
          no warranties or representations about the accuracy or completeness of
          this site’s content.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          We will not be liable for any damages of any kind arising from the use
          of this site, including but not limited to direct, indirect,
          incidental, punitive, and consequential damages.
        </p>

        <h2>6. Changes to These Terms</h2>
        <p>
          We may revise these Terms of Use at any time. Any changes will be
          posted on this page, and your continued use of the site constitutes
          acceptance of those changes.
        </p>

        <h2>7. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
          info@logivis.com
        </p>
      </div>
    </div>
  );
};

export default TermsOfUse;
