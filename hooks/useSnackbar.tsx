import Text from '@/Text';
import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { Snackbar } from 'react-native-paper';
import { IMusicKit } from 'types';

interface SnackbarContextProps {
  showSnackbar: (message: string) => void;
  playbackSnackBar: (kit: IMusicKit, duration?: number) => void;
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
  const [ kitData, setKitData ] = useState<{ kit: IMusicKit; duration?: number } | null>(null);
  const [ visible, setVisible ] = useState(false);
  const [ message, setMessage ] = useState('');
  const [ timer, setTimer ] = useState<NodeJS.Timeout | null>(null);

  const display = useCallback(() => {
    if (timer) {
      setTimer(null);
    }
    setVisible(true);
    const tempTimer = setTimeout(() => {
      setVisible(false);
      setKitData(null);
    }, 3000);
    setTimer(tempTimer);
  }, [ timer ]);

  const showSnackbar = useCallback((msg: string) => {
    setMessage(msg);
    display();
  }, [ display ]);

  const playbackSnackBar = useCallback((kit: IMusicKit, duration?: number) => {
    setKitData({ kit, duration });
    display();
  }, [ display ]);

  const hideSnackbar = () => {
    setVisible(false);
    setKitData(null);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, playbackSnackBar }}>
      {children}
      { !kitData &&
        <Snackbar
          visible={visible}
          onDismiss={() => null}
        >
          {message}
        </Snackbar>
      }
      {
        !!kitData &&
        <Snackbar
          visible={visible}
          onDismiss={() => null}
        >
          <Text bold>{ kitData.kit.title }</Text>
          <Text>{ kitData.kit.artist } - { kitData.duration }ms</Text>
        </Snackbar>
      }
    </SnackbarContext.Provider>
  );
};
