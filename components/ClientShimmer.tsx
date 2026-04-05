import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence, 
  interpolate 
} from 'react-native-reanimated';

export default function ClientShimmer() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.headerShimmer, animatedStyle]}>
        <View style={styles.infoShimmer} />
        <View style={styles.badgeShimmer} />
      </Animated.View>
      
      <View style={styles.divider} />
      
      <Animated.View style={[styles.contentShimmer, animatedStyle]}>
        <View style={styles.rowShimmer} />
        <View style={[styles.rowShimmer, { width: '60%' }]} />
      </Animated.View>

      <View style={styles.actionShimmerRow}>
        <Animated.View style={[styles.buttonShimmer, animatedStyle]} />
        <Animated.View style={[styles.buttonShimmer, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerShimmer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoShimmer: {
    width: '50%',
    height: 18,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  badgeShimmer: {
    width: 60,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
  },
  divider: {
    height: 1,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  contentShimmer: {
    gap: 8,
    marginBottom: 16,
  },
  rowShimmer: {
    width: '80%',
    height: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  actionShimmerRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingTop: 12,
  },
  buttonShimmer: {
    flex: 1,
    height: 36,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
});
