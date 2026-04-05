import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
// NOTE: use standard expo-router. 'react-native-expo-router' is a typo but fixing here
import { 
  Search, 
  Plus, 
  Server, 
  Globe, 
  User, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  X,
  CreditCard,
  Briefcase
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';
import ClientShimmer from '@/components/ClientShimmer';
import { hostingApi, vendorApi } from '@/lib/api';

export default function HostingListScreen() {
  const [hostings, setHostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [vendors, setVendors] = useState<any[]>([]);

  // Alerts
  const [expiringSoonCount, setExpiringSoonCount] = useState<number>(0);
  const [expiredCount, setExpiredCount] = useState<number>(0);
  const [isAlertVisible, setIsAlertVisible] = useState(true);

  // Fetch Vendors for Filters
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await vendorApi.getProviders();
        setVendors(Array.isArray(response) ? response : (response.data || []));
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    fetchVendors();
  }, []);

  // Fetch Alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await hostingApi.getRenewalAlerts();
        const data = response.data || {};
        setExpiringSoonCount(Number(data.expiringSoon || 0));
        setExpiredCount(Number(data.expired || 0));
      } catch (error) {
        console.error('Error fetching renewal alerts:', error);
      }
    };
    fetchAlerts();
  }, []);

  const fetchHostings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await hostingApi.getHostings({
        page: isRefresh ? 1 : page,
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        provider: vendorFilter === 'all' ? '' : vendorFilter,
      });

      if (isRefresh || page === 1) {
        setHostings(response.data || response || []);
        if (isRefresh) setPage(1);
      } else {
        setHostings(prev => {
          const newHostings = response.data || response || [];
          const existingIds = new Set(prev.map((d: any) => d._id || d.id));
          const filteredNew = Array.isArray(newHostings) ? newHostings.filter((d: any) => !existingIds.has(d._id || d.id)) : [];
          return [...prev, ...filteredNew];
        });
      }
      setTotalPages(response.pagination?.pages || response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching hostings:', error);
      if (isRefresh || page === 1) {
        setHostings([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [page, searchTerm, statusFilter, vendorFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchHostings(true);
    }, [searchTerm, statusFilter, vendorFilter])
  );

  useEffect(() => {
    if (page > 1) {
      fetchHostings(false);
    }
  }, [page]);

  const paginationRef = useRef({ loading, loadingMore, page, totalPages, length: hostings.length });
  useEffect(() => {
    paginationRef.current = { loading, loadingMore, page, totalPages, length: hostings.length };
  }, [loading, loadingMore, page, totalPages, hostings.length]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!viewableItems || viewableItems.length === 0) return;
    const { loading: rLoading, loadingMore: rLoadingMore, page: rPage, totalPages: rTotalPages, length } = paginationRef.current;
    
    const maxIndex = Math.max(...viewableItems.map((v: any) => v.index));
    
    if (maxIndex >= length - 4) {
      if (!rLoading && !rLoadingMore && rPage < rTotalPages) {
        setPage(rPage + 1);
      }
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 10 }).current;

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Hosting',
      `Are you sure you want to delete hosting for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await hostingApi.deleteHosting(id);
              fetchHostings(true);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete hosting account');
            }
          }
        }
      ]
    );
  };

  const renderHostingCard = ({ item, index }: { item: any; index: number }) => {
    const clientName = item.clientName || item.client?.company || item.company || item.client?.name || 'N/A';
    const providerName = item.provider?.name || item.provider || 'N/A';
    const serviceTypeName = item.serviceType?.name || item.serviceType || 'Unknown Type';
    const domainName = item.domainName || item.domain?.name || item.domain || 'No Domain Linked';
    
    let daysRemaining = 999;
    if (item.renewalDate) {
       const expDate = new Date(item.renewalDate);
       const now = new Date();
       daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    let expiryStatusLabel = 'Active';
    let expiryColorClass = '#10B981'; // Green
    if (daysRemaining < 0) {
      expiryStatusLabel = 'Expired';
      expiryColorClass = '#EF4444'; // Red
    } else if (daysRemaining <= 30) {
      expiryStatusLabel = 'Expiring Soon';
      expiryColorClass = '#F59E0B'; // Orange
    }

    const handleEditNavigate = () => {
      require('expo-router').router.push({ 
        pathname: '/manage/hosting/add', 
        params: { id: item._id || item.id, payload: JSON.stringify(item) } 
      });
    };

    return (
      <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
        <Pressable 
          style={styles.card} 
          onPress={handleEditNavigate}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBox}>
                <Server size={20} color="#4F46E5" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.domainName} numberOfLines={1}>{domainName}</Text>
                <Text style={styles.serviceType}>{serviceTypeName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactInfo}>
            <View style={styles.infoRow}>
              <Briefcase size={14} color="#6B7280" />
              <Text style={styles.infoText}>{clientName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Server size={14} color="#6B7280" />
              <Text style={styles.infoText}>Provider: {providerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <CreditCard size={14} color="#6B7280" />
              <Text style={styles.infoText}>Monthly Cost: ${Number(item.monthlyCost || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.dot, { backgroundColor: expiryColorClass }]} />
              <Text style={[styles.infoText, { color: expiryColorClass, fontWeight: '600' }]}>
                {item.renewalDate ? new Date(item.renewalDate).toLocaleDateString() : 'N/A'} • {expiryStatusLabel}
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
              style={[styles.actionButton, styles.renewButton]}
              onPress={() => require('expo-router').router.push({ pathname: '/manage/hosting/renew', params: { id: item._id || item.id, name: domainName, renewalDate: item.renewalDate } })}
            >
              <Server size={16} color="#059669" />
              <Text style={[styles.actionText, styles.renewText]}>Renew</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item._id || item.id, domainName)}
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
          title: 'Hosting',
          headerRight: () => (
            <Pressable onPress={() => require('expo-router').router.push('/manage/hosting/add')} style={styles.addButton}>
              <Plus size={24} color="#4F46E5" />
            </Pressable>
          )
        }} 
      />

      {isAlertVisible && (expiringSoonCount > 0 || expiredCount > 0) && (
        <Animated.View entering={FadeInUp} style={styles.alertBanner}>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Hosting Renewal Alerts</Text>
            <Text style={styles.alertText}>
              {expiringSoonCount > 0 ? `${expiringSoonCount} account(s) renewing within 30 days.` : ''}
              {expiringSoonCount > 0 && expiredCount > 0 ? ' ' : ''}
              {expiredCount > 0 ? `${expiredCount} account(s) already expired.` : ''}
            </Text>
          </View>
          <Pressable onPress={() => setIsAlertVisible(false)} style={styles.closeAlert}>
            <X size={16} color="#92400E" />
          </Pressable>
        </Animated.View>
      )}

      {/* Search and Filters */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hosting..."
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

        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', 'active', 'expiring', 'expired']}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.statusFilters}
          renderItem={({ item: status }) => (
            <Pressable
              onPress={() => setStatusFilter(status)}
              style={[styles.tab, statusFilter === status && styles.activeTab]}
            >
              <Text style={[styles.tabText, statusFilter === status && styles.activeTabText]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={hostings}
        renderItem={renderHostingCard}
        keyExtractor={item => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchHostings(true)} />
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#4F46E5" style={{ marginVertical: 20 }} />
          ) : null
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
              <Server size={48} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Hosting Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters.</Text>
            </View>
          )
        }
      />

      <Pressable 
        style={styles.fab} 
        onPress={() => require('expo-router').router.push('/manage/hosting/add')}
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
  alertBanner: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#92400E',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  alertText: {
    color: '#92400E',
    fontSize: 12,
  },
  closeAlert: {
    padding: 4,
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
    gap: 8,
    paddingRight: 16,
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  domainName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  serviceType: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
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
  renewButton: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  renewText: {
    color: '#059669',
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
