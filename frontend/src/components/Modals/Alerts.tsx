interface MessageTemplate {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

const messageTemplate = (
  title: string,
  message: string,
  confirmText: string,
  cancelText: string
): MessageTemplate => ({
  title,
  message,
  confirmText,
  cancelText,
});

export const messages = {
  CONFIRM_ACTION: messageTemplate(
    'Confirm Action',
    'Are you sure you want to proceed?',
    'Yes',
    'No'
  ),
  DELETE_ITEM: messageTemplate(
    'Delete Item',
    'Are you sure you want to delete this item?',
    'Yes',
    'No'
  ),
  SAVE_CHANGES: messageTemplate(
    'Save Changes',
    'Are you sure you want to save these changes?',
    'Yes',
    'No'
  ),
};
