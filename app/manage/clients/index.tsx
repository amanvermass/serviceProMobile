import React, { useState, useEffect, useCallback } from 'react';
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
import { 
  Search, 
  Plus, 
  Filter, 
  User, 
  Mail, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  X,
  PlusCircle
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';
import ClientShimmer from '@/components/ClientShimmer';
import { clientApi } from '@/lib/api';

export default function ClientListScreen() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchClients = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await clientApi.getClients({
        page: isRefresh ? 1 : page,
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
      });

      if (isRefresh || page === 1) {
        setClients(response.data || []);
        if (isRefresh) setPage(1);
      } else {
        setClients(prev => {
          const newClients = response.data || [];
          const existingIds = new Set(prev.map((c: any) => c._id || c.id));
          const filteredNew = newClients.filter((c: any) => !existingIds.has(c._id || c.id));
          return [...prev, ...filteredNew];
        });
      }
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching clients:', error);
      if (isRefresh || page === 1) {
        setClients([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [page, searchTerm, statusFilter]);

  // Initial fetch and on search/filter change
  useFocusEffect(
    useCallback(() => {
      fetchClients(true);
    }, [searchTerm, statusFilter])
  );

  // Fetch more when page increments
  useEffect(() => {
    if (page > 1) {
      fetchClients(false);
    }
  }, [page]);

  // Keep a stable ref of pagination state to avoid re-creating onViewableItemsChanged
  const paginationRef = React.useRef({ loading, loadingMore, page, totalPages, length: clients.length });
  useEffect(() => {
    paginationRef.current = { loading, loadingMore, page, totalPages, length: clients.length };
  }, [loading, loadingMore, page, totalPages, clients.length]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!viewableItems || viewableItems.length === 0) return;
    const { loading: rLoading, loadingMore: rLoadingMore, page: rPage, totalPages: rTotalPages, length } = paginationRef.current;
    
    const maxIndex = Math.max(...viewableItems.map((v: any) => v.index));
    
    // Load next page when 4 items are left
    if (maxIndex >= length - 4) {
      if (!rLoading && !rLoadingMore && rPage < rTotalPages) {
        setPage(rPage + 1);
      }
    }
  }, []);

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 10 }).current;

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clientApi.deleteClient(id);
              fetchClients(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete client');
            }
          }
        }
      ]
    );
  };

  const renderClientCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
      <Pressable 
        style={styles.card} 
        onPress={() => router.push({ pathname: '/manage/clients/add', params: { id: item._id || item.id } })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{item.company}</Text>
            <StatusBadge type={item.status || 'active'} />
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </View>

        <View style={styles.divider} />

        <View style={styles.contactInfo}>
          <View style={styles.infoRow}>
            <User size={14} color="#6B7280" />
            <Text style={styles.infoText}>{item.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Mail size={14} color="#6B7280" />
            <Text style={styles.infoText}>{item.email}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push({ pathname: '/manage/clients/add', params: { id: item._id || item.id } })}
          >
            <Edit3 size={16} color="#4F46E5" />
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
          <Pressable 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item._id, item.company)}
          >
            <Trash2 size={16} color="#EF4444" />
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Clients',
          headerRight: () => (
            <Pressable onPress={() => router.push('/manage/clients/add')} style={styles.addButton}>
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
            placeholder="Search clients..."
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
          {['all', 'active', 'pending', 'inactive'].map((status) => (
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
        data={clients}
        renderItem={renderClientCard}
        keyExtractor={item => item._id || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchClients(true)} />
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
              <User size={48} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Clients Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters.</Text>
            </View>
          )
        }
      />

      <Pressable 
        style={styles.fab} 
        onPress={() => router.push('/manage/clients/add')}
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
    fontSize: 12,
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
  companyInfo: {
    flex: 1,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
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
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
