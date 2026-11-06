import { Feather } from '@expo/vector-icons';
import { Image, type ImageProps } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useQ } from '@/theme';
import { itemImageUrl } from '@/utils/steam';

type ItemImageProps = Omit<ImageProps, 'source'> & {
  /** The item's Steam icon (`icon_url` / `image`) */
  iconUrl?: string | null;
  /** A full image URL, for images that don't come as a Steam icon */
  uri?: string | null;
  /** Square size in pixels for Steam's CDN to resize the icon to */
  size?: number;
};

/** An item's image, or a placeholder when it has none or it fails to load (Steam sometimes gives an item a new icon) */
export function ItemImage({ iconUrl, uri, size, style, onError, ...rest }: ItemImageProps) {
  const q = useQ();
  const src = iconUrl ? itemImageUrl(iconUrl, size) : uri || null;
  // Kept per source, so a recycled list row tries its new image
  const [ failedSrc, setFailedSrc ] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    const width = StyleSheet.flatten(style)?.width;
    const iconSize = typeof width === 'number' ? Math.min(48, Math.max(14, Math.round(width * 0.3))) : 24;
    return (
      <View style={[ style as StyleProp<ViewStyle>, styles.fallback ]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Feather name="image" size={iconSize} color={q.faint} />
      </View>
    );
  }

  return (
    <Image
      {...rest}
      source={{ uri: src }}
      style={style}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
