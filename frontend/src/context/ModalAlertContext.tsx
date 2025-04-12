// src/context/ModalAlertContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import ModalAlert from '../components/Modals/ModalAlert'; // Import ModalAlert component
import { messages } from '../components/Modals/Alerts'; // Import message templates
import { ModalProps } from '../types/types';

interface ModalContextType {
  showModal: (
    messageKey: keyof typeof messages,
    onConfirm?: () => void
  ) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modalProps, setModalProps] = useState<Omit<
    ModalProps,
    'isOpen'
  > | null>(null);

  const showModal = useCallback(
    (messageKey: keyof typeof messages, onConfirm?: () => void) => {
      const message = messages[messageKey];
      setModalProps({
        title: message.title,
        message: message.message,
        confirmText: message.confirmText,
        cancelText: message.cancelText,
        onConfirm: () => {
          closeModal();
          onConfirm?.();
        },
        onClose: closeModal,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalProps(null);
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      {modalProps && (
        <ModalAlert
          isOpen={true}
          title={modalProps.title}
          message={modalProps.message}
          onClose={closeModal}
          onConfirm={modalProps.onConfirm}
          confirmText={modalProps.confirmText}
          cancelText={modalProps.cancelText}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
