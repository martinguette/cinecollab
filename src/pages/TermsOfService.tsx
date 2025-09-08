import React from 'react';

const TermsOfService: React.FC = () => (
  <div className="max-w-2xl mx-auto px-4 py-10 text-gray-800">
    <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
    <p className="mb-4">Last updated: September 8, 2025</p>
    <p className="mb-4">
      Welcome to CineCollab! This application is provided by Martin Guette for
      educational and entertainment purposes only. By using CineCollab, you
      agree to the following terms:
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">1. Non-Commercial Use</h2>
    <p className="mb-4">
      CineCollab is not intended for commercial use. The app is a personal
      project and is not monetized in any way.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">2. No Data Collection</h2>
    <p className="mb-4">
      CineCollab does not collect, store, or share any personal information. Any
      authentication is solely for access and is not used for tracking or
      advertising.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">
      3. Educational and Entertainment Purpose
    </h2>
    <p className="mb-4">
      The app is designed for learning and entertainment. All content and
      features are provided as-is, without warranty of any kind.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">
      4. Limitation of Liability
    </h2>
    <p className="mb-4">
      Martin Guette is not responsible for any damages or losses resulting from
      the use of CineCollab. Use the app at your own risk.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">5. Contact</h2>
    <p className="mb-4">
      For questions about these terms, contact Martin Guette at{' '}
      <a href="mailto:zerisawa33@gmail.com" className="text-blue-600 underline">
        zerisawa33@gmail.com
      </a>
      .
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">6. Jurisdiction</h2>
    <p className="mb-4">
      CineCollab is operated from Colombia and is subject to Colombian law.
    </p>
  </div>
);

export default TermsOfService;
