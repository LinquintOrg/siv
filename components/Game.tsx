import { Image, Pressable, View } from 'react-native';
import { global } from 'styles/global';
import { IInventoryGame } from 'types';
import Text from './Text';
import styles from 'styles/components/game';

interface IPropsGame {
  game: IInventoryGame;
  isActive: boolean;
  onClick: (arg: number) => void;
}

export default function Game(props: IPropsGame) {
  const { game, isActive, onClick } = props;

  return (
    <Pressable style={[ styles.wrapper, isActive ? styles.active : null ]} onPress={() => onClick(game.appid)}>
      <Image source={{ uri: game.img }} style={styles.image} />
      <View style={global.column}>
        <Text bold style={styles.gameTitle}>{ game.name }</Text>
        <Text style={styles.gameId}>{ game.appid }</Text>
      </View>
    </Pressable>
  );
}
