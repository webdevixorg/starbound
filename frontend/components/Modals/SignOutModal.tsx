import React from 'react';

interface SignOutModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const SignOutModal: React.FC<SignOutModalProps> = ({
  showModal,
  setShowModal,
  onConfirm,
  onCancel,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Confirm Sign Out</h2>
        <p className="mb-6">Are you sure you want to log out?</p>
        <div className="flex justify-end">
          <button
            className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded mr-2"
            onClick={() => {
              onCancel();
              setShowModal(false);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => {
              onConfirm();
              setShowModal(false);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutModal;
