// frontend/src/components/Modal.jsx
import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
        className="relative z-50 bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;