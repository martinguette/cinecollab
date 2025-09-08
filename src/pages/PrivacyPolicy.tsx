import React from 'react';

const PrivacyPolicy: React.FC = () => (
  <div className="max-w-2xl mx-auto px-4 py-10 text-gray-800">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-4">Last updated: September 8, 2025</p>
    <p className="mb-4">
      CineCollab is an educational and entertainment platform created by Martin
      Guette. This app is not intended for commercial use and does not collect,
      store, or share any personal information from users.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">
      Information Collection and Use
    </h2>
    <p className="mb-4">
      CineCollab does not collect or store any personal data. The app is used
      solely for didactic and entertainment purposes. No user data is sold,
      shared, or used for advertising.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Third-Party Services</h2>
    <p className="mb-4">
      CineCollab may use third-party services (such as Google OAuth for
      authentication) only to provide access to the app. No personal information
      is retained or used beyond authentication.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
    <p className="mb-4">
      If you have any questions about this Privacy Policy, please contact Martin
      Guette at{' '}
      <a href="mailto:zerisawa33@gmail.com" className="text-blue-600 underline">
        zerisawa33@gmail.com
      </a>
      .
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Jurisdiction</h2>
    <p className="mb-4">
      This app is operated from Colombia and is intended for educational and
      entertainment use only.
    </p>
  </div>
);

export default PrivacyPolicy;
