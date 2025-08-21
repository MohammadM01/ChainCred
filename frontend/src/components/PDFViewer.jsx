import React, { useState } from 'react';

export default function PDFViewer({ url, onClose }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Certificate Viewer</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3ba2f] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading certificate...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Certificate Unavailable
              </h3>
              <p className="text-gray-600 mb-4">
                The certificate file is currently not accessible. This could be due to:
              </p>
              <ul className="text-left text-gray-600 mb-6 max-w-md mx-auto">
                <li className="mb-2">• Testnet storage limitations</li>
                <li className="mb-2">• File processing delays</li>
                <li className="mb-2">• Temporary network issues</li>
              </ul>
              <div className="bg-gray-100 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-600 mb-2">File URL:</p>
                <p className="text-xs font-mono text-gray-800 break-all">{url}</p>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                In production, this would display the actual PDF certificate.
              </div>
            </div>
          )}

          {!error && !loading && (
            <iframe
              src={url}
              className="w-full h-[70vh] border-0"
              onLoad={handleLoad}
              onError={handleError}
              title="Certificate PDF"
            />
          )}
        </div>
      </div>
    </div>
  );
}
