import { Image, Pressable, View } from 'react-native';
import { global } from 'styles/global';
import { IInventoryGame } from 'types';
import Text from './Text';
import styles from 'styles/components/game';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useState } from 'react';

interface IPropsGame {
  game: IInventoryGame;
  isActive: boolean;
  onClick: (arg: string) => void;
}

export default function Game({ game, isActive = false, onClick }: IPropsGame) {
  const backgroundColor = useSharedValue('#fff0');
  const [ isActiveState, setIsActive ] = useState(isActive);

  function onGameClick() {
    setIsActive(!isActiveState);
    onClick(game.appid);
    backgroundColor.value = withTiming(!isActiveState ? '#355bd544' : '#fff0', { duration: 150 });
  }

  return (
    <Pressable onPress={() => onGameClick()}>
      <Animated.View style={[ styles.wrapper, { backgroundColor } ]}>
        <Image source={{ uri: game.img }} style={styles.image} />
        <View style={global.column}>
          <Text bold style={styles.gameTitle}>{ game.name }</Text>
          <Text style={styles.gameId}>{ game.appid }</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}
