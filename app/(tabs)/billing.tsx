import React, { useState } from 'react';
import { StyleSheet, FlatList, TextInput, Pressable, ScrollView } from 'react-native';
import { Search, Filter, Download } from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import BillingCard, { BillingItem } from '@/components/BillingCard';

const MOCK_DATA: BillingItem[] = [
  {
    id: '1',
    company: 'TechCorp Solutions',
    client: 'John Doe',
    domain: { status: 'Paid', date: 'May 15, 2024', payment: 'Full Payment' },
    hosting: { status: 'Unpaid', date: 'Jun 20, 2024', payment: 'Full Payment' },
    maintenance: { status: 'Not Raised', date: 'May 1, 2024', payment: 'Not Raised' },
  },
  {
    id: '2',
    company: 'Digital Innovations Inc',
    client: 'Sarah Smith',
    domain: { status: 'Paid', date: 'Apr 10, 2024', payment: 'Full Payment' },
    hosting: { status: 'Paid', date: 'Apr 30, 2024', payment: 'Full Payment' },
    maintenance: { status: 'Paid', date: 'Mar 20, 2024', payment: 'Full Payment' },
  },
  {
    id: '3',
    company: 'GreenStart Ventures',
    client: 'Michael Brown',
    domain: { status: 'Not Raised', date: 'May 25, 2024', payment: 'Not Raised' },
    hosting: { status: 'Unpaid', date: 'May 15, 2024', payment: 'Partial Payment' },
    maintenance: { status: 'Not Raised', date: 'Apr 5, 2024', payment: 'Not Raised' },
  },
  {
    id: '4',
    company: 'Wellness Hub',
    client: 'Emily Davis',
    domain: { status: 'Paid', date: 'Jul 10, 2024', payment: 'Full Payment' },
    hosting: { status: 'Unpaid', date: 'Jun 5, 2024', payment: 'Partial Payment' },
    maintenance: { status: 'Unpaid', date: 'Apr 15, 2024', payment: 'Partial Payment' },
  },
];

export default function BillingScreen() {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Project Billing</Text>
        <Text style={styles.subtitle}>
          Unified financial tracking for domain registrations, hosting services, and maintenance agreements.
        </Text>
        
        <Pressable style={styles.exportButton}>
          <Download size={18} color="#FFF" />
          <Text style={styles.exportText}>Export Report</Text>
        </Pressable>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by project title, client, or ID..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <Filter size={18} color="#6B7280" />
          <Text style={styles.filterText}>Filter</Text>
        </Pressable>
      </View>

      <FlatList
        data={MOCK_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BillingCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  exportText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 44,
  },
  filterText: {
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
});
