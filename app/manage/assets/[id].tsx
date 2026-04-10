import React from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  ChevronLeft, 
  Edit3, 
  Box, 
  Calendar, 
  MapPin, 
  Tag, 
  FileText, 
  History,
  User,
  Clock,
  ExternalLink
} from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';
import { mockAssets } from '@/constants/MockAssets';

const { width: windowWidth } = Dimensions.get('window');

export default function AssetDetailsScreen() {
  const { id } = useLocalSearchParams();
  const asset = mockAssets.find(a => a.id === id);

  if (!asset) {
    return (
      <View style={styles.center}>
        <Text>Asset not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: '#4F46E5', fontWeight: 'bold' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Asset Details',
          headerRight: () => (
            <Pressable 
              onPress={() => router.push({ pathname: '/manage/assets/add', params: { id: asset.id } })}
              style={styles.headerAction}
            >
              <Edit3 size={22} color="#4F46E5" />
            </Pressable>
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
            <View style={styles.imagePlaceholder}>
                <Box size={40} color="#4F46E5" />
            </View>
            <View style={styles.headerMain}>
                <Text style={styles.assetName}>{asset.assetName}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.assetId}>{asset.id}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.assetType}>{asset.type}</Text>
                </View>
                <View style={{ marginTop: 10, alignSelf: 'flex-start' }}>
                    <StatusBadge type={asset.status.toLowerCase().replace(' ', '') as any} />
                </View>
            </View>
        </View>

        {/* Info Grid */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <FileText size={18} color="#4F46E5" />
                <Text style={styles.sectionTitle}>Asset Information</Text>
            </View>
            <View style={styles.infoCard}>
                <InfoItem label="Serial Number" value={asset.serialNumber || 'N/A'} icon={Tag} />
                <InfoItem label="Value" value={asset.value || 'N/A'} icon={Tag} />
                <InfoItem label="Location" value={asset.location || 'N/A'} icon={MapPin} />
                <View style={styles.fullWidthInfo}>
                    <Text style={styles.infoLabel}>Description</Text>
                    <Text style={styles.descriptionText}>{asset.description || 'No description available for this asset.'}</Text>
                </View>
            </View>
        </View>

        {/* Currently Lent To (If applicable) */}
        {asset.status === 'Lent' && asset.lentTo && (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <ExternalLink size={18} color="#4F46E5" />
                    <Text style={styles.sectionTitle}>Currently Assigned To</Text>
                </View>
                <View style={styles.lentCard}>
                    <View style={styles.personAvatar}>
                        <Text style={styles.avatarText}>{asset.lentTo.avatar}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.personName}>{asset.lentTo.name}</Text>
                        <Text style={styles.personMeta}>Assigned on {asset.date}</Text>
                    </View>
                    <Pressable 
                        style={styles.actionIcon}
                        onPress={() => router.push({ pathname: '/manage/assets/lend', params: { id: asset.id } })}
                    >
                        <Clock size={20} color="#4F46E5" />
                    </Pressable>
                </View>
            </View>
        )}

        {/* History Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <History size={18} color="#4F46E5" />
                <Text style={styles.sectionTitle}>Activity History</Text>
            </View>
            {asset.history && asset.history.length > 0 ? (
                <View style={styles.historyList}>
                    {asset.history.map((record, index) => (
                        <View key={record.id} style={[styles.historyItem, index === asset.history!.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.historyHeader}>
                                <View style={styles.personSmallAvatar}>
                                    <Text style={styles.smallAvatarText}>{record.personnel.avatar}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.historyPerson}>{record.personnel.name}</Text>
                                    <Text style={styles.historyRole}>{record.personnel.role || 'Staff'}</Text>
                                </View>
                                {record.status === 'Currently Lent' ? (
                                    <View style={styles.activeIndicator}><Text style={styles.activeText}>Active</Text></View>
                                ) : (
                                    <Text style={styles.returnDate}>Returned</Text>
                                )}
                            </View>
                            
                            <View style={styles.historyDates}>
                                <View style={styles.dateBlock}>
                                    <Text style={styles.dateLabel}>Date Given</Text>
                                    <Text style={styles.dateValue}>{record.dateGiven}</Text>
                                </View>
                                <View style={styles.dateBlock}>
                                    <Text style={styles.dateLabel}>Expected Return</Text>
                                    <Text style={styles.dateValue}>{record.estimatedReturn}</Text>
                                </View>
                            </View>

                            {record.returnedBy && (
                                <View style={styles.returnerInfo}>
                                    <View style={[styles.personSmallAvatar, { backgroundColor: '#475569' }]}>
                                        <Text style={[styles.smallAvatarText, { color: '#FFF' }]}>{record.returnedBy.avatar}</Text>
                                    </View>
                                    <Text style={styles.returnerText}>Returned to <Text style={{ fontWeight: 'bold' }}>{record.returnedBy.name}</Text></Text>
                                </View>
                            )}

                            {record.notes && (
                                <Text style={styles.historyNotes}>"{record.notes}"</Text>
                            )}
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyHistory}>
                    <Clock size={40} color="#E5E7EB" />
                    <Text style={styles.emptyText}>No lending history found.</Text>
                </View>
            )}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
          <Pressable 
            style={styles.primaryBtn}
            onPress={() => router.push({ pathname: '/manage/assets/lend', params: { id: asset.id } })}
          >
              <Text style={styles.primaryBtnText}>
                {asset.status === 'Lent' ? 'Update Assignment' : 'Lend Asset'}
              </Text>
          </Pressable>
      </View>
    </View>
  );
}

function InfoItem({ label, value, icon: Icon }: any) {
    return (
        <View style={styles.infoItem}>
            <View style={styles.infoIconWrapper}>
                <Icon size={16} color="#4F46E5" />
            </View>
            <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    marginTop: 12,
  },
  headerAction: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  headerMain: {
    flex: 1,
    marginLeft: 20,
  },
  assetName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  assetId: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  assetType: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 1,
  },
  fullWidthInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginTop: 6,
  },
  lentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  personMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyList: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  historyItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  personSmallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAF9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  smallAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  },
  historyPerson: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  historyRole: {
    fontSize: 12,
    color: '#64748B',
  },
  activeIndicator: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    textTransform: 'uppercase',
  },
  returnDate: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  historyDates: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 16,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  returnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  returnerText: {
    fontSize: 12,
    color: '#64748B',
  },
  historyNotes: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 16,
    paddingLeft: 4,
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
