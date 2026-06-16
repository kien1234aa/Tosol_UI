import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';
import { useAppColors } from '../../theme/ThemeContext';

export type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
  width?: number;
  children: ReactNode;
  drawerStyle?: StyleProp<ViewStyle>;
};

export function SideDrawer({
  open,
  onClose,
  width: widthProp,
  children,
  drawerStyle,
}: SideDrawerProps) {
  const { width: winW } = useWindowDimensions();
  const width =
    widthProp ?? Math.min(300, Math.max(240, Math.round(winW * 0.82)));
  const colors = useAppColors();
  const slide = useRef(new Animated.Value(open ? 0 : -width)).current;
  const fade = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: open ? 0 : -width,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: open ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, width, slide, fade]);

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.layer]}
      pointerEvents={open ? 'box-none' : 'none'}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        disabled={!open}
        accessibilityLabel="Dong menu"
      >
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: fade, backgroundColor: colors.bgOverlay },
          ]}
        />
      </Pressable>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.drawerWrap,
          { width },
          { transform: [{ translateX: slide }] },
          drawerStyle,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    maxWidth: '100%',
  },
});

export default SideDrawer;
