import type { ReactNode } from 'react';
import { Avatar, List } from 'react-native-paper';

interface Props {
  name: string;
  avatar: string;
  description?: string;
  onPress: () => void;
  right?: ReactNode;
}

export function ProfileRow({ name, avatar, description, onPress, right }: Props) {
  return (
    <List.Item
      title={name}
      description={description}
      onPress={onPress}
      left={({ style }) => <Avatar.Image size={40} source={{ uri: avatar }} style={style} />}
      right={right ? () => right : undefined}
    />
  );
}
