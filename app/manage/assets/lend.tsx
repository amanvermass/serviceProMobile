import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput, 
  Alert,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { 
  User, 
  Calendar as CalendarIcon, 
  Save, 
  X, 
  ChevronDown, 
  Check,
  Search,
  FileText,
  Info
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, View } from '@/components/Themed';
import { mockAssets, mockPersonnel } from '@/constants/MockAssets';
import StatusBadge from '@/components/StatusBadge';

export default function LendAssetScreen() {
  const { id } = useLocalSearchParams();
  const asset = mockAssets.find(a => a.id === id);

  const [loading, setLoading] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [lentDate, setLentDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 60)); // +30 days
  const [remarks, setRemarks] = useState('');
  
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [showLentDatePicker, setShowLentDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPersonnel = mockPersonnel.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLend = () => {
    if (!selectedPersonnel) {
      Alert.alert('Error', 'Please select an employee.');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Asset Lent', 
        `${asset?.assetName} has been assigned to ${selectedPersonnel.name} until ${returnDate.toLocaleDateString()}.`,
        [{ text: 'Great', onPress: () => router.back() }]
      );
    }, 1200);
  };

  if (!asset) {
    return (
      <View style={styles.errorContainer}>
        <Text>Asset not found</Text>
        <Pressable onPress={() => router.back()}><Text style={{color: '#4F46E5', marginTop: 10}}>Go Back</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Lend Asset',
          headerRight: () => (
            <Pressable onPress={handleLend} disabled={loading} style={styles.headerSave}>
              {loading ? <ActivityIndicator size="small" color="#4F46E5" /> : <Save size={24} color="#4F46E5" />}
            </Pressable>
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Asset Summary Card */}
        <View style={styles.assetSummary}>
            <View style={styles.summaryHeader}>
                <View>
                    <Text style={styles.assetLabel}>Lending Asset</Text>
                    <Text style={styles.assetName}>{asset.assetName}</Text>
                    <Text style={styles.assetId}>{asset.id}</Text>
                </View>
                <StatusBadge type={asset.status.toLowerCase().replace(' ', '') as any} />
            </View>
        </View>

        <View style={styles.formContainer}>
            {/* Personnel Selection */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Employee *</Text>
                <Pressable 
                    style={styles.selectButton} 
                    onPress={() => setIsPersonnelModalOpen(true)}
                >
                    <View style={styles.selectLeft}>
                        <User size={20} color="#9CA3AF" />
                        <Text style={[styles.selectText, !selectedPersonnel && { color: '#9CA3AF' }]}>
                            {selectedPersonnel ? selectedPersonnel.name : 'Choose employee...'}
                        </Text>
                    </View>
                    <ChevronDown size={20} color="#6B7280" />
                </Pressable>
                {selectedPersonnel && (
                    <Text style={styles.deptText}>{selectedPersonnel.department} Department</Text>
                )}
            </View>

            {/* Dates Row */}
            <View style={styles.dateRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Lend Date</Text>
                    <Pressable 
                        style={styles.dateButton} 
                        onPress={() => setShowLentDatePicker(true)}
                    >
                        <CalendarIcon size={18} color="#4F46E5" />
                        <Text style={styles.dateText}>{lentDate.toLocaleDateString()}</Text>
                    </Pressable>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Expected Return</Text>
                    <Pressable 
                        style={styles.dateButton} 
                        onPress={() => setShowReturnDatePicker(true)}
                    >
                        <CalendarIcon size={18} color="#F59E0B" />
                        <Text style={styles.dateText}>{returnDate.toLocaleDateString()}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Remarks */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Lending Remarks</Text>
                <View style={styles.textAreaWrapper}>
                    <FileText size={20} color="#9CA3AF" style={styles.textIcon} />
                    <TextInput
                        style={styles.textArea}
                        placeholder="Purpose of lending, current condition, etc..."
                        multiline
                        numberOfLines={4}
                        value={remarks}
                        onChangeText={setRemarks}
                        textAlignVertical="top"
                    />
                </View>
            </View>

            <View style={styles.infoBox}>
                <Info size={16} color="#3B82F6" />
                <Text style={styles.infoText}>
                    Upon saving, the asset status will automatically change to "Lent".
                </Text>
            </View>
        </View>

        <Pressable 
            style={[styles.submitButton, (loading || !selectedPersonnel) && styles.disabledButton]} 
            onPress={handleLend}
            disabled={loading || !selectedPersonnel}
        >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Confirm Assignment</Text>}
        </Pressable>
      </ScrollView>

      {/* Date Pickers */}
      {showLentDatePicker && (
        <DateTimePicker
          value={lentDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowLentDatePicker(false);
            if (date) setLentDate(date);
          }}
        />
      )}
      {showReturnDatePicker && (
        <DateTimePicker
          value={returnDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowReturnDatePicker(false);
            if (date) setReturnDate(date);
          }}
        />
      )}

      {/* Personnel Modal */}
      <Modal
        visible={isPersonnelModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPersonnelModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Employee</Text>
                    <Pressable onPress={() => setIsPersonnelModalOpen(false)} style={styles.closeIcon}>
                        <X size={24} color="#6B7280" />
                    </Pressable>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={18} color="#9CA3AF" />
                    <TextInput
                        style={styles.modalSearchInput}
                        placeholder="Search by name or department..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView style={styles.personnelList}>
                    {filteredPersonnel.map(person => (
                        <Pressable 
                            key={person.id} 
                            style={styles.personItem}
                            onPress={() => {
                                setSelectedPersonnel(person);
                                setIsPersonnelModalOpen(false);
                            }}
                        >
                            <View style={styles.personAvatar}>
                                <Text style={styles.avatarText}>{person.avatar}</Text>
                            </View>
                            <View style={styles.personInfo}>
                                <Text style={styles.personName}>{person.name}</Text>
                                <Text style={styles.personDept}>{person.department}</Text>
                            </View>
                            {selectedPersonnel?.id === person.id && (
                                <Check size={20} color="#4F46E5" />
                            )}
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSave: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  assetSummary: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  assetId: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectText: {
    fontSize: 16,
    color: '#111827',
  },
  deptText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  dateText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  textAreaWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
  },
  textIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    height: 100,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeIcon: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
    marginBottom: 20,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
  },
  personnelList: {
    flex: 1,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  personDept: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
