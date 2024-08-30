import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { Snackbar } from 'react-native-paper';

interface SnackbarContextProps {
  showSnackbar: (message: string) => void;
}

interface SnackbarProviderProps {
  children: ReactNode;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(undefined);

export const useSnackbar = (): SnackbarContextProps => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [ visible, setVisible ] = useState(false);
  const [ message, setMessage ] = useState('');

  const showSnackbar = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  const hideSnackbar = () => setVisible(false);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={3000}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
