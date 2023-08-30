import * as React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import gamesJson from '../assets/inv-games.json';
import { IChooseGamesProps, IInventoryGame } from '../utils/types';
import { helpers } from '../utils/helpers';
import Text from '../components/Text';
import { colors, global, styles, variables } from '../styles/global';
import { Icon } from 'react-native-elements';
import { Snackbar } from 'react-native-paper';

export default function ChooseGames(props: IChooseGamesProps) {
  const { route, navigation } = props;
  const games = gamesJson as { games: IInventoryGame[] };
  const [ selected, setSelected ] = React.useState<IInventoryGame[]>([]);
  const [ previousGames, setPreviousGames ] = React.useState<IInventoryGame[]>([]);
  const [ snackbarVisible, setSnackbarVisible ] = React.useState(false);
  const [ errorText, setErrorText ] = React.useState('');

  React.useEffect(() => {
    async function prepare() {
      try {
        setPreviousGames([]);
        const previous = await helpers.loadPreviousGames(route.params.steamId);
        setPreviousGames(previous);
      } catch (err) {
        setErrorText('Failed to load previous games');
        setSnackbarVisible(true);
      }
    }
    void prepare();
  }, []);

  async function proceedToLoading() {
    if (selected.length === 0) {
      setErrorText('Choose at least one game.');
      setSnackbarVisible(true);
      return;
    }
    await helpers.savePreviousGames(route.params.steamId, selected);
    navigation.navigate('Inventory', { games: selected, steamId: route.params.steamId });
  }

  function appendPreviousGames() {
    previousGames.forEach(game => {
      if (!selected.find(g => g.appid === game.appid)) {
        setSelected(selected.concat(game));
      }
    });
  }

  function toggleGame(game: IInventoryGame) {
    const isSelected = selected.find(g => g.appid === game.appid);
    if (isSelected) {
      setSelected(selected.filter(g => g.appid !== game.appid));
    } else {
      setSelected(selected.concat(game));
    }
  }

  return (
    <View style={{ height: '100%' }}>
      <Text bold style={global.title}>Select games</Text>
      <ScrollView>
        {games.games.map((game, index) => (
          <TouchableOpacity key={`game-${index}`} style={global.rowContainer} onPress={() => toggleGame(game)}>
            <Image style={ global.rowImage } source={{ uri: game.url } } />

            <View style={[ global.column, { width: helpers.resize(295) } ]}>
              <Text bold style={styles.games.title}>{ game.name }</Text>
              <Text style={styles.games.appid}>{ game.appid }</Text>
            </View>

            <Icon
              name={ selected.find(g => g.appid === game.appid) ? 'check-circle' : 'circle' }
              type='feather'
              size={variables.iconSize}
              style={{ alignSelf: 'center' }}
              color={colors.primary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text bold style={global.title}>Previously used games</Text>
      {
        previousGames.length === 0 ?
          <Text style={global.subtitle}>No previous games</Text> :
          <View style={ global.column }>
            <Text style={global.subtitle}>Click to add previous games to selection</Text>
            <TouchableOpacity
              style={[ global.row, { width: '85%', alignSelf: 'center' } ]}
              onPress={() => appendPreviousGames()}
            >
              <ScrollView style={[ { width: '90%', flexWrap: 'wrap' }, global.row ]} horizontal showsHorizontalScrollIndicator={false}>
                {
                  previousGames.map((game, index) => (
                    <Image key={`previous-${index}`} style={ global.rowImage } source={{ uri: game.url }} />
                  ))
                }
              </ScrollView>
            </TouchableOpacity>
          </View>
      }

      <TouchableOpacity style={ global.buttonLarge }
        onPress={() => void proceedToLoading()}
      >
        <Text bold style={ global.buttonText }>Select games</Text>
      </TouchableOpacity>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        style={{ backgroundColor: colors.error }}
        duration={3000}
      >
        <View><Text style={ global.snackbarText }>{ errorText }</Text></View>
      </Snackbar>
    </View>
  );
}
