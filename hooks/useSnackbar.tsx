import Text from '@/Text';
import { colors } from '@styles/global';
import { helpers } from '@utils/helpers';
import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
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
    }, 5000);
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
          style={[ { marginBottom: helpers.resize(80) }, style.error.container ]}
        >
          <Text style={style.error.title}>Error occurred</Text>
          <Text bold style={style.error.text}>{ message }</Text>
        </Snackbar>
      }
      {
        !!kitData &&
        <Snackbar
          visible={visible}
          onDismiss={() => null}
          style={[ { marginBottom: helpers.resize(80) } ]}
        >
          <Text style={style.musicKit.title}>MVP Anthem is playing</Text>
          <Text bold style={style.musicKit.kitTitle}>{ kitData.kit.title }</Text>
          <Text style={style.musicKit.kitArtist}>
            { kitData.kit.artist } - { Math.ceil((kitData.duration || 0) / 1000) } seconds
          </Text>
        </Snackbar>
      }
    </SnackbarContext.Provider>
  );
};

const style = {
  error: StyleSheet.create({
    container: {
      backgroundColor: colors.error,
    },
    text: {
      color: colors.onError,
    },
    title: {
      color: colors.onError,
      fontSize: helpers.resize(18),
      marginBottom: helpers.resize(8),
    },
  }),
  musicKit: StyleSheet.create({
    title: {
      color: colors.primary,
      fontSize: helpers.resize(18),
      marginBottom: helpers.resize(8),
    },
    kitTitle: {
      fontSize: helpers.resize(16),
    },
    kitArtist: {
      fontSize: helpers.resize(14),
      color: colors.textAccent,
    },
  }),
};
