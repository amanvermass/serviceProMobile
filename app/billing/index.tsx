import BillingCard, { BillingItem } from '@/components/BillingCard';
import { Text, View } from '@/components/Themed';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Download, Filter, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput } from 'react-native';

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
      <Stack.Screen 
        options={{ 
          title: 'Billing',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
              <ChevronLeft size={24} color="#111827" />
            </Pressable>
          ),
        }} 
      />

      <View style={styles.headerSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              placeholder="Search by project, client, or ID..."
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Filter size={18} color="#6B7280" />
          </Pressable>
          <Pressable style={styles.exportButton}>
            <Download size={18} color="#FFF" />
            <Text style={styles.exportText}>Export</Text>
          </Pressable>
        </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
  },
  exportText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
});
