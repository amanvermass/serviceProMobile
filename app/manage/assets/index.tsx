import React, { useState, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  Pressable, 
  TextInput, 
  ScrollView,
  Modal,
  Dimensions,
  Image
} from 'react-native';
import { router, Stack } from 'expo-router';
import { 
  Search, 
  Plus, 
  Filter, 
  Box, 
  User, 
  Calendar, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  X,
  MoreVertical,
  Eye,
  Handshake,
  Settings,
  Wrench
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';
import { mockAssets, Asset } from '@/constants/MockAssets';

const { width: windowWidth } = Dimensions.get('window');

export default function AssetsListScreen() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = 
        asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.lentTo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
      const matchesType = typeFilter === 'all' || asset.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, statusFilter, typeFilter]);

  const toggleActionMenu = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsActionModalOpen(true);
  };

  const getCategoryColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hardware': return { bg: '#EFF6FF', flex: '#3B82F6' };
      case 'software': return { bg: '#F5F3FF', flex: '#8B5CF6' };
      case 'accessory': return { bg: '#FFF7ED', flex: '#F59E0B' };
      default: return { bg: '#F3F4F6', flex: '#6B7280' };
    }
  };

  const renderAssetCard = ({ item, index }: { item: Asset; index: number }) => {
    const colors = getCategoryColor(item.type);
    
    return (
      <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
        <Pressable 
          style={styles.card} 
          onPress={() => router.push(`/manage/assets/${item.id}`)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.assetBasicInfo}>
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.bg, borderColor: colors.flex + '20' }]}>
                  <Box size={24} color={colors.flex} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.assetName}>{item.assetName}</Text>
                  <Text style={styles.assetId}>{item.id}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
                <Pressable 
                  onPress={(e) => {
                    e.stopPropagation();
                    if (item.status === 'Available') {
                      router.push({ pathname: '/manage/assets/lend', params: { id: item.id } });
                    } else {
                      toggleActionMenu(item);
                    }
                  }}
                >
                  <StatusBadge type={item.status.toLowerCase().replace(' ', '') as any} />
                </Pressable>
                <Pressable 
                    onPress={(e) => {
                        e.stopPropagation();
                        toggleActionMenu(item);
                    }} 
                    style={styles.moreButton}
                >
                    <MoreVertical size={20} color="#9CA3AF" />
                </Pressable>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <View style={[styles.typeTag, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.typeTagText, { color: colors.flex }]}>{item.type}</Text>
                  </View>
              </View>
              <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Lent To</Text>
                  {item.lentTo ? (
                      <View style={styles.lentInfo}>
                          <View style={[styles.avatar, { backgroundColor: colors.flex }]}>
                              <Text style={styles.avatarText}>{item.lentTo.avatar}</Text>
                          </View>
                          <Text style={styles.lentName}>{item.lentTo.name}</Text>
                      </View>
                  ) : (
                      <Text style={styles.detailValue}>-</Text>
                  )}
              </View>
          </View>

          <View style={styles.cardFooter}>
              <View style={styles.footerInfo}>
                  <Calendar size={14} color="#6B7280" />
                  <Text style={styles.footerText}>{item.date || 'N/A'}</Text>
              </View>
              <View style={styles.footerInfo}>
                  <ChevronRight size={16} color="#9CA3AF" />
              </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Assets',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12 }}>
            </View>
          )
        }} 
      />

      {/* Search and Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets, ID, personnel..."
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

        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterBar}
        >
          <Pressable
            onPress={() => setStatusFilter('all')}
            style={[styles.filterChip, statusFilter === 'all' && styles.activeChip]}
          >
            <Text style={[styles.chipText, statusFilter === 'all' && styles.activeChipText]}>All Status</Text>
          </Pressable>
          {['Available', 'Lent', 'Non Functional', 'Repairing'].map((status) => (
            <Pressable
              key={status}
              onPress={() => setStatusFilter(status)}
              style={[styles.filterChip, statusFilter === status && styles.activeChip]}
            >
              <Text style={[styles.chipText, statusFilter === status && styles.activeChipText]}>{status}</Text>
            </Pressable>
          ))}
          <View style={styles.chipDivider} />
          <Pressable
            onPress={() => setTypeFilter('all')}
            style={[styles.filterChip, typeFilter === 'all' && styles.activeChip]}
          >
            <Text style={[styles.chipText, typeFilter === 'all' && styles.activeChipText]}>All Types</Text>
          </Pressable>
          {['Hardware', 'Software', 'Accessory'].map((type) => (
            <Pressable
              key={type}
              onPress={() => setTypeFilter(type)}
              style={[styles.filterChip, typeFilter === type && styles.activeChip]}
            >
              <Text style={[styles.chipText, typeFilter === type && styles.activeChipText]}>{type}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredAssets}
        renderItem={renderAssetCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Box size={60} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No Assets Found</Text>
            <Text style={styles.emptySubtitle}>Adjust your search or filters to see more results.</Text>
          </View>
        }
      />

      <Pressable 
        style={styles.fab} 
        onPress={() => router.push('/manage/assets/add')}
      >
        <Plus size={28} color="#FFF" />
      </Pressable>

      {/* Action Modal */}
      <Modal
        visible={isActionModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsActionModalOpen(false)}
      >
        <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setIsActionModalOpen(false)}
        >
            <Animated.View 
                entering={FadeInUp}
                style={styles.modalContent}
            >
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedAsset?.assetName}</Text>
                    <Text style={styles.modalSubtitle}>{selectedAsset?.id}</Text>
                </View>
                
                <View style={styles.modalActions}>
                    <Pressable 
                        style={styles.modalActionItem} 
                        onPress={() => { 
                            setIsActionModalOpen(false);
                            router.push(`/manage/assets/${selectedAsset?.id}`);
                        }}
                    >
                        <Eye size={20} color="#4B5563" />
                        <Text style={styles.modalActionText}>View Details</Text>
                    </Pressable>
                    <Pressable 
                        style={styles.modalActionItem} 
                        onPress={() => { 
                            setIsActionModalOpen(false);
                            router.push({ pathname: '/manage/assets/add', params: { id: selectedAsset?.id } });
                        }}
                    >
                        <Edit3 size={20} color="#4B5563" />
                        <Text style={styles.modalActionText}>Edit Info</Text>
                    </Pressable>
                    <Pressable 
                        style={styles.modalActionItem} 
                        onPress={() => { 
                            setIsActionModalOpen(false);
                            router.push({ pathname: '/manage/assets/lend', params: { id: selectedAsset?.id } });
                        }}
                    >
                        <Handshake size={20} color="#4B5563" />
                        <Text style={styles.modalActionText}>Lend Asset</Text>
                    </Pressable>
                    <View style={styles.modalDivider} />
                    <Pressable style={[styles.modalActionItem, styles.deleteAction]} onPress={() => { setIsActionModalOpen(false); }}>
                        <Trash2 size={20} color="#EF4444" />
                        <Text style={[styles.modalActionText, { color: '#EF4444' }]}>Delete Asset</Text>
                    </Pressable>
                </View>
                
                <Pressable 
                    style={styles.modalCloseButton}
                    onPress={() => setIsActionModalOpen(false)}
                >
                    <Text style={styles.modalCloseText}>Cancel</Text>
                </Pressable>
            </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerIcon: {
    padding: 4,
  },
  filterSection: {
    backgroundColor: '#FFF',
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeChip: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  chipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#4F46E5',
  },
  chipDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginHorizontal: 4,
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
    marginBottom: 16,
  },
  assetBasicInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  assetId: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreButton: {
    padding: 4,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  lentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  lentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
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
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalActions: {
    gap: 8,
  },
  modalActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  deleteAction: {
    backgroundColor: '#FEF2F2',
  },
  modalCloseButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
});
