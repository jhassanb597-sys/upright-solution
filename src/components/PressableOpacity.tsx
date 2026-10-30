import React from 'react';
import {Pressable, PressableProps, StyleProp, ViewStyle} from 'react-native';
import {HIT} from '../theme';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
};

/** Pressable with a mobile-friendly hitSlop and pressed-opacity feedback. */
export function PressableOpacity({style, activeOpacity = 0.7, hitSlop = HIT, disabled, ...rest}: Props) {
  return (
    <Pressable
      hitSlop={hitSlop}
      disabled={disabled}
      accessibilityRole="button"
      style={({pressed}) => [style, pressed && {opacity: activeOpacity}, disabled && {opacity: 0.5}]}
      {...rest}
    />
  );
}
