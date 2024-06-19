import { useSnackbar } from 'hooks/useSnackbar';
import React, { useEffect } from 'react';

const GlobalErrorHandler: React.FC = () => {
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const defaultHandler = ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(error => {
      showSnackbar(`Unhandled error: ${error.message}`);
      if (defaultHandler) {
        defaultHandler(error);
      }
    });

    global.Promise = require('promise');
    require('promise/lib/rejection-tracking').enable({
      allRejections: true,
      onUnhandled: (_id: number, error: string | Error) => {
        if (typeof error === 'string') {
          showSnackbar(error);
        } else if (typeof error === 'object') {
          showSnackbar(error.message);
        }
      },
    });
  }, [ showSnackbar ]);

  return null;
};

export default GlobalErrorHandler;
