import { useSnackbar } from 'hooks/useSnackbar';
import React, { useEffect } from 'react';

const GlobalErrorHandler: React.FC = () => {
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const defaultHandler = ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(error => {
      console.error('error happened');
      console.error(JSON.stringify(error, null, 2));
      if (typeof error === 'string') {
        showSnackbar(error);
      } else if (typeof error === 'object' && !Array.isArray(error) && 'message' in error) {
        showSnackbar(error.message);
      }
      if (defaultHandler) {
        defaultHandler(error);
      }
    });

    global.Promise = require('promise');
    require('promise/lib/rejection-tracking').enable({
      allRejections: true,
      onUnhandled: (_id: number, error: string | Error) => {
        console.error('promise error happened');
        if (typeof error === 'string') {
          showSnackbar(error);
          console.error(JSON.stringify(error));
        } else if (typeof error === 'object' && !Array.isArray(error) && 'message' in error) {
          showSnackbar(error.message);
          console.error(error.message, error.stack || 'stack', error.cause);
        }
      },
    });
  }, [ showSnackbar ]);

  return null;
};

export default GlobalErrorHandler;
