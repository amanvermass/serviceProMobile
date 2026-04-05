import React from 'react';
import { StyleSheet, FlatList, Pressable } from 'react-native';
import { Bell, Calendar, Mail, AlertTriangle } from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';

const REMINDERS = [
  {
    id: '1',
    title: 'Domain Renewal Soon',
    message: 'TechCorp Solutions domain expires in 3 days. Send invoice?',
    date: 'Apr 2, 2026',
    type: 'Urgent',
    icon: Calendar,
    color: '#EF4444',
  },
  {
    id: '2',
    title: 'Payment Received',
    message: 'Wellness Hub has paid ₹500 for Hosting services.',
    date: 'Apr 1, 2026',
    type: 'Info',
    icon: Bell,
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Invoice Not Raised',
    message: 'GreenStart Ventures maintenance invoice needs to be generated.',
    date: 'Mar 31, 2026',
    type: 'Warning',
    icon: AlertTriangle,
    color: '#F59E0B',
  },
  {
    id: '4',
    title: 'New Client Onboarded',
    message: 'Emily Davis added to Wellness Hub project.',
    date: 'Mar 30, 2026',
    type: 'Info',
    icon: Mail,
    color: '#3B82F6',
  },
];

export default function RemindersScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.count}>{REMINDERS.length} NEW</Text>
      </View>

      <FlatList
        data={REMINDERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '10' }]}>
              <item.icon size={20} color={item.color} />
            </View>
            <View style={styles.content}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <View style={styles.footer}>
                <StatusBadge type={item.type as any} label={item.type} />
                <Text style={styles.action}>VIEW DETAILS</Text>
              </View>
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  count: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  date: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  message: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  action: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
});
