import { toast } from 'react-toastify';

const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        toast.success(message, {
          position: 'bottom-right',
          autoClose: 3000,
        });
        break;
      case 'error':
        toast.error(message, {
          position: 'bottom-right',
          autoClose: 3000,
        });
        break;
      case 'info':
        toast.info(message, {
          position: 'bottom-right',
          autoClose: 3000,
        });
        break;
      default:
        toast(message, { position: 'bottom-right', autoClose: 3000 });
    }
  };

  return { showToast };
};

export default useToast;
