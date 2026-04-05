import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  RefreshControl, 
  Alert,
  Image
} from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  X,
  Globe,
  Briefcase
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';
import ClientShimmer from '@/components/ClientShimmer';
import { vendorApi } from '@/lib/api';

export default function VendorListScreen() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchVendors = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await vendorApi.getProviders();
      let data = Array.isArray(response) ? response : (response.data || []);
      
      // Clean data map
      data = data.map((item: any) => ({
        id: item._id || item.id || '',
        name: item.name || '',
        logo: item.logo || '',
        website: (item.website || '').replace(/`/g, '').trim().replace(/^['"]+|['"]+$/g, ''),
        activeDomains: Number(item.activeDomains || 0),
        totalCost: Number(item.totalCost || 0),
        type: item.type || 'both',
        status: item.status || 'active',
        ...item
      }));

      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVendors(true);
    }, [fetchVendors])
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Vendor',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await vendorApi.deleteProvider(id);
              fetchVendors(true);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete vendor');
            }
          }
        }
      ]
    );
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderVendorCard = ({ item, index }: { item: any; index: number }) => {
    const isImageLogo = item.logo && (item.logo.startsWith('/') || item.logo.startsWith('http'));
    const logoUrl = isImageLogo 
      ? (item.logo.startsWith('http') ? item.logo : `${process.env.EXPO_PUBLIC_API_URL || 'https://domainapi.kvtmedia.com'}${item.logo}`)
      : null;

    const initials = item.name ? item.name.substring(0, 2).toUpperCase() : '??';

    const handleEditNavigate = () => {
      router.push({ 
        pathname: '/manage/vendors/add', 
        params: { id: item.id, payload: JSON.stringify(item) } 
      });
    };

    return (
      <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
        <Pressable 
          style={styles.card} 
          onPress={handleEditNavigate}
        >
          <View style={styles.cardHeader}>
            <View style={styles.vendorInfoRow}>
              <View style={styles.logoContainer}>
                {logoUrl ? (
                  <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.logoText}>{item.logo && item.logo !== 'N/A' && item.logo !== 'null' ? item.logo : initials}</Text>
                )}
              </View>
              <View style={styles.nameContainer}>
                <Text style={styles.vendorName} numberOfLines={1}>{item.name}</Text>
                {!!item.website && (
                  <Text style={styles.vendorWebsite} numberOfLines={1}>
                    {item.website.replace(/^https?:\/\//, '')}
                  </Text>
                )}
              </View>
            </View>
            <StatusBadge type={item.status || 'active'} />
          </View>

          <View style={styles.divider} />

          <View style={styles.contactInfo}>
            <View style={styles.infoRow}>
              <Globe size={14} color="#6B7280" />
              <Text style={styles.infoText}>Active Domains: <Text style={{ fontWeight: 'bold' }}>{item.activeDomains}</Text></Text>
            </View>
            <View style={styles.infoRow}>
              <Briefcase size={14} color="#6B7280" />
              <Text style={styles.infoText}>
                Total Cost: <Text style={{ fontWeight: 'bold' }}>${item.totalCost.toFixed(2)}</Text>
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoText, { marginLeft: 22, fontSize: 12 }]}>
                Avg/Domain: ${item.activeDomains ? (item.totalCost / item.activeDomains).toFixed(2) : '0.00'}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable 
              style={styles.actionButton}
              onPress={handleEditNavigate}
            >
              <Edit3 size={16} color="#4F46E5" />
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id, item.name)}
            >
              <Trash2 size={16} color="#EF4444" />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Vendors',
          headerRight: () => (
            <Pressable onPress={() => router.push('/manage/vendors/add')} style={styles.addButton}>
              <Plus size={24} color="#4F46E5" />
            </Pressable>
          )
        }} 
      />

      {/* Search and Filters */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9CA3AF"
          />
          {searchTerm.length > 0 && (
            <Pressable onPress={() => setSearchTerm('')}>
              <X size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        <View style={styles.statusFilters}>
          {['all', 'active', 'inactive'].map((status) => (
            <Pressable
              key={status}
              onPress={() => setStatusFilter(status)}
              style={[styles.tab, statusFilter === status && styles.activeTab]}
            >
              <Text style={[styles.tabText, statusFilter === status && styles.activeTabText]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredVendors}
        renderItem={renderVendorCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchVendors(true)} />
        }
        ListEmptyComponent={
          loading ? (
            <View>
              <ClientShimmer />
              <ClientShimmer />
              <ClientShimmer />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Briefcase size={48} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Vendors Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or add a new one.</Text>
            </View>
          )
        }
      />

      <Pressable 
        style={styles.fab} 
        onPress={() => router.push('/manage/vendors/add')}
      >
        <Plus size={28} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    padding: 8,
  },
  filterBar: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
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
  vendorInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4B5563',
  },
  nameContainer: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  vendorWebsite: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  contactInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  deleteButton: {
    borderColor: '#FCA5A5',
  },
  deleteText: {
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});
