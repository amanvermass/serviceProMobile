import React, { useState } from 'react';
import { StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { Globe, Server, HardDrive, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';

type RenewalCategory = 'Domain' | 'Hosting' | 'Maintenance' | 'Email';

const RENEWALS_DATA: Record<RenewalCategory, any[]> = {
  Domain: [
    { id: '1', company: 'TechCorp Solutions', client: 'John Doe', status: 'Paid', date: 'May 15, 2024', payment: 'Full Payment' },
    { id: '2', company: 'GreenStart Ventures', client: 'Michael Brown', status: 'Unpaid', date: 'Jun 10, 2024', payment: 'Partial Payment' },
  ],
  Hosting: [
    { id: '3', company: 'Digital Innovations Inc', client: 'Sarah Smith', status: 'Paid', date: 'Apr 30, 2024', payment: 'Full Payment' },
    { id: '4', company: 'Wellness Hub', client: 'Emily Davis', status: 'Unpaid', date: 'May 5, 2024', payment: 'Partial Payment' },
  ],
  Maintenance: [
    { id: '5', company: 'Eco Friendly Co', client: 'Alice Johnson', status: 'Not Raised', date: 'Jun 20, 2024', payment: 'Not Raised' },
  ],
  Email: [
    { id: '6', company: 'Cloud Nine', client: 'Bob Wilson', status: 'Paid', date: 'Jul 01, 2024', payment: 'Full Payment' },
  ],
};

const CATEGORIES: { label: RenewalCategory; icon: any }[] = [
  { label: 'Domain', icon: Globe },
  { label: 'Hosting', icon: Server },
  { label: 'Maintenance', icon: HardDrive },
  { label: 'Email', icon: Mail },
];

export default function RenewalsScreen() {
  const [activeTab, setActiveTab] = useState<RenewalCategory>('Domain');

  const navigateToDetail = (item: any) => {
    router.push({
      pathname: '/renewals/[id]',
      params: { id: item.id, payload: JSON.stringify(item) }
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable style={styles.card} onPress={() => navigateToDetail(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.company}</Text>
          <Text style={styles.clientLabel}>CLIENT: <Text style={styles.clientName}>{item.client}</Text></Text>
        </View>
        <StatusBadge type={item.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>RENEWAL DATE</Text>
          <Text style={styles.detailValue}>{item.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>PAYMENT TYPE</Text>
          <StatusBadge type={item.payment} label={item.payment.split(' ')[0]} />
        </View>
      </View>

      <Pressable style={styles.actionButton} onPress={() => navigateToDetail(item)}>
        <Text style={styles.actionText}>View Detail</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Renewals</Text>
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.label}
                onPress={() => setActiveTab(cat.label)}
                style={[styles.tab, activeTab === cat.label && styles.activeTab]}>
                <cat.icon size={16} color={activeTab === cat.label ? '#111827' : '#6B7280'} />
                <Text style={[styles.tabText, activeTab === cat.label && styles.activeTabText]}>
                  {cat.label} ({RENEWALS_DATA[cat.label]?.length || 0})
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={RENEWALS_DATA[activeTab]}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} renewals found.</Text>
          </View>
        }
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    padding: 20,
    paddingBottom: 10,
  },
  tabsContainer: {
    paddingBottom: 10,
  },
  tabsScroll: {
    paddingHorizontal: 15,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  clientLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  clientName: {
    color: '#4B5563',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  actionButton: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
