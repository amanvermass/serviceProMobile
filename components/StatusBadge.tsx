import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type StatusType = string; // Accept any status string

interface StatusBadgeProps {
  type: StatusType;
  label?: string;
}

export default function StatusBadge({ type, label }: StatusBadgeProps) {
  let color = '#6B7280'; // Default gray
  let bgColor = '#F3F4F6'; // Light gray background

  // Specific mappings for known statuses
  const statusKey = type.toLowerCase().replace(/\s/g, '');

  if (statusKey === 'active' || statusKey === 'available') {
    color = '#059669'; // Emerald-600
    bgColor = '#ECFDF5';
  } else if (statusKey === 'inactive' || statusKey === 'nonfunctional') {
    color = '#E11D48'; // Rose-600
    bgColor = '#FFF1F2';
  } else if (statusKey === 'paid') {
    color = '#10B981'; // Green-500
    bgColor = '#F0FDF4';
  } else if (statusKey === 'unpaid' || statusKey === 'repairing') {
    color = '#D97706'; // Amber-600
    bgColor = '#FFFBEB';
  } else if (statusKey === 'lent' || statusKey === 'fullpayment') {
    color = '#4F46E5'; // Indigo-600
    bgColor = '#EEF2FF';
  } else if (statusKey === 'partialpayment' || statusKey === 'pending') {
    color = '#8B5CF6'; // Purple-600
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
