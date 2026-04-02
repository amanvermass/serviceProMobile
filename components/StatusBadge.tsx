import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type StatusType = 'Paid' | 'Unpaid' | 'Not Raised' | 'Partial Payment' | 'Full Payment';

interface StatusBadgeProps {
  type: StatusType;
  label?: string;
}

export default function StatusBadge({ type, label }: StatusBadgeProps) {
  let color = '#6B7280'; // Gray
  let bgColor = '#F3F4F6';

  if (type === 'Paid') {
    color = '#10B981'; // Green
    bgColor = '#ECFDF5';
  } else if (type === 'Unpaid') {
    color = '#F59E0B'; // Orange
    bgColor = '#FFFBEB';
  } else if (type === 'Not Raised') {
    color = '#9CA3AF'; // Light gray
    bgColor = '#F9FAFB';
  } else if (type === 'Full Payment') {
    color = '#3B82F6'; // Blue
    bgColor = '#EFF6FF';
  } else if (type === 'Partial Payment') {
    color = '#8B5CF6'; // Purple
    bgColor = '#F5F3FF';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color: color }]}>{label || type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
