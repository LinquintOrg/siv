import Button from '@/Button';
import Game from '@/Game';
import Profile from '@/Profile';
import Text from '@/Text';
import { helpers } from '@utils/helpers';
import { sql } from '@utils/sql';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import useStore from 'store';
import { global } from 'styles/global';
import { ISteamProfile } from 'types';

export default function InventoryGamesSelectPage() {
  const store = useStore();
  const { id } = useGlobalSearchParams();
  const [ user, setUser ] = useState<ISteamProfile | string | null>(null);
  const [ selectedGames, setSelectedGames ] = useState<string[]>([]);
  const [ pageInFocus, setPageInFocus ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setPageInFocus(true);
      return () => {
        setPageInFocus(false);
      };
    }, []),
  );


  useEffect(() => {
    async function prepare() {
      if (!id) {
        return;
      }

      try {
        const userById = await sql.getOneProfile(id as string);
        if (userById) {
          setUser(userById);
        } else {
          setUser(id as string);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (pageInFocus && !user) {
      prepare();
    }
  }, [ pageInFocus, user, id ]);

  function setGameActive(id: string) {
    const existing = selectedGames.includes(id);
    if (selectedGames.length >= 3 && !existing) {
      return;
    }

    const temp = helpers.clone(selectedGames);
    if (existing) {
      setSelectedGames(temp.filter(g => g !== id));
    } else {
      setSelectedGames(temp.concat(id));
    }
  }

  function selectGames() {
    if (selectedGames.length > 0) {
      router.replace(`/inventory/${id as string}?games=${selectedGames.join(',')}`);
    } else {
      throw new Error('Select at least one game.');
    }
  }

  return (
    <>
      <Text bold style={global.titleSmall}>Selected Profile</Text>
      {
        user && <>
          <View>
            {
              typeof user === 'string' ?
                <Text>User: { user }</Text> :
                <Profile profile={user} nonClickable />
            }
          </View>

          <Text bold style={[ global.title, { marginBottom: helpers.resize(4) } ]}>Select Games</Text>

          <FlatList
            data={store.games}
            renderItem={({ item }) => <Game game={item} isActive={selectedGames.includes(item.appid)} onClick={setGameActive} />}
            keyExtractor={item => `app-${item.appid}`}
          />

          <Button
            text={`Select games (${selectedGames.length}/3)`}
            style={{ marginTop: helpers.resize(12) }}
            onPress={() => selectGames()}
          />
        </>
      }
    </>
  );
}
