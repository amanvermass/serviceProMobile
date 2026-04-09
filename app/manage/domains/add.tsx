import ClientShimmer from '@/components/ClientShimmer';
import { Text, View } from '@/components/Themed';
import { clientApi, domainApi, vendorApi } from '@/lib/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  Briefcase,
  Building,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  Globe,
  Save
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput
} from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

export default function DomainFormScreen() {
  const { id, payload } = useLocalSearchParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(isEditing && !payload);
  const [toastMessage, setToastMessage] = useState('');

  // Dropdown data
  const [clients, setClients] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectLoading, setSelectLoading] = useState(true);
  
  // Modals for styling dropdown on iOS/Android
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Form State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    domainName: '',
    clientId: '',
    vendorId: '',
    expiryDate: '',
    cost: '',
    purchasedBy: 'kvtmedia',
    autoRenew: false,
    status: 'active',
  });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setSelectLoading(true);
        const [clientsRes, vendorsRes] = await Promise.all([
          clientApi.getClients({ limit: 100 }),
          vendorApi.getProviders()
        ]);
        setClients(clientsRes.data || []);
        setVendors(Array.isArray(vendorsRes) ? vendorsRes : (vendorsRes.data || []));
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      } finally {
        setSelectLoading(false);
      }
    };
    fetchSelectData();
  }, []);

  const populateForm = (domain: any) => {
    let resolvedVendorId = typeof domain.registrar === 'string' ? domain.registrar : domain.registrar?._id || '';

    setFormData({
      domainName: domain.domainName || domain.name || '',
      clientId: domain.client?._id || domain.client?.id || domain.client || domain.clientId || '',
      vendorId: resolvedVendorId,
      expiryDate: domain.expiryDate ? new Date(domain.expiryDate).toISOString().split('T')[0] : '',
      cost: domain.cost ? String(domain.cost) : '',
      purchasedBy: domain.purchasedBy || 'kvtmedia',
      autoRenew: domain.autoRenew || false,
      status: domain.status || 'active',
    });
  };

  const titleCase = (val: string) => {
    return String(val || '')
      .replace(/-/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchDomainDetails = async () => {
      try {
        if (payload) {
          const domain = JSON.parse(payload as string);
          populateForm(domain);
          return;
        }

        setDataLoading(true);
        const response = await domainApi.getDomainById(id as string);
        const domain = response?.data || response?.domain || response;
        if (domain) populateForm(domain);
      } catch (error) {
        console.error('Error loading domain details:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (isEditing) {
      fetchDomainDetails();
    }
  }, [id, payload, isEditing]);

  const handleSave = async () => {
    if (!formData.domainName || !formData.clientId || !formData.vendorId || !formData.expiryDate || !formData.cost) {
      setToastMessage('Please fill all required fields carefully.');
      setTimeout(() => setToastMessage(''), 2000);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        domainName: formData.domainName,
        clientId: formData.clientId,
        registrar: formData.vendorId, // Backend maps vendor to registrar usually
        expiryDate: formData.expiryDate,
        cost: parseFloat(formData.cost) || 0,
        purchasedBy: formData.purchasedBy,
        autoRenew: formData.autoRenew,
        status: isEditing ? formData.status : 'active',
      };

      await domainApi.saveDomain(id as string || null, payload);
      setToastMessage(`Domain ${isEditing ? 'updated' : 'added'} successfully!`);
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      console.error('Error saving domain:', error);
      setToastMessage('Failed to save domain. Please check your connection.');
      setTimeout(() => setToastMessage(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c._id === clientId || c.id === clientId);
    return client ? (client.company || client.companyName || client.name) : 'Select Client';
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v._id === vendorId || v.id === vendorId);
    return vendor ? vendor.name : 'Select Vendor';
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      if (Platform.OS === 'ios') setShowDatePicker(false);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setFormData(prev => ({ ...prev, expiryDate: `${year}-${month}-${day}` }));
    }
  };

  if (dataLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: isEditing ? 'Edit Domain' : 'Add Domain',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
              <ChevronLeft size={24} color="#111827" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={loading} style={styles.headerButton}>
              {loading ? (
                <ActivityIndicator size="small" color="#4F46E5" />
              ) : (
                <Save size={20} color="#4F46E5" />
              )}
            </Pressable>
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Core Info Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Domain Overview</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Domain Name *</Text>
            <View style={styles.inputWrapper}>
              <Globe size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. kvtmedia.com"
                value={formData.domainName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, domainName: text }))}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client *</Text>
            <Pressable 
              style={styles.dropdownButton}
              onPress={() => setIsClientModalOpen(true)}
            >
              <View style={styles.dropdownContent}>
                <Building size={18} color="#9CA3AF" style={styles.inputIcon} />
                {selectLoading && !formData.clientId ? (
                  <View style={styles.inlineShimmer} />
                ) : (
                  <Text style={formData.clientId ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {getClientName(formData.clientId)}
                  </Text>
                )}
              </View>
              <ChevronDown size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vendor (Registrar) *</Text>
            <Pressable 
              style={styles.dropdownButton}
              onPress={() => setIsVendorModalOpen(true)}
            >
              <View style={styles.dropdownContent}>
                <Briefcase size={18} color="#9CA3AF" style={styles.inputIcon} />
                {selectLoading && !formData.vendorId ? (
                  <View style={styles.inlineShimmer} />
                ) : (
                  <Text style={formData.vendorId ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {getVendorName(formData.vendorId)}
                  </Text>
                )}
              </View>
              <ChevronDown size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Pricing and Dates Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifecycle & Cost</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Expiry Date *</Text>
              {Platform.OS === 'web' ? (
                <View style={styles.inputWrapper}>
                  <Calendar size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <input 
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    style={{
                      flex: 1,
                      fontSize: 15,
                      color: '#111827',
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      padding: 0,
                      margin: 0,
                      height: '100%',
                      width: '100%',
                      fontFamily: 'inherit'
                    }}
                  />
                </View>
              ) : (
                <Pressable 
                  style={styles.dropdownButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.dropdownContent}>
                    <Calendar size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <Text style={formData.expiryDate ? styles.dropdownText : styles.dropdownPlaceholder}>
                      {formData.expiryDate || 'YYYY-MM-DD'}
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Annual Cost *</Text>
              <View style={styles.inputWrapper}>
                <CreditCard size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={formData.cost}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Purchased By</Text>
            <View style={styles.tabsContainer}>
              <Pressable
                style={[styles.tab, formData.purchasedBy === 'kvtmedia' && styles.activeTab]}
                onPress={() => setFormData(prev => ({ ...prev, purchasedBy: 'kvtmedia' }))}
              >
                <Text style={[styles.tabText, formData.purchasedBy === 'kvtmedia' && styles.activeTabText]}>KVT Media</Text>
              </Pressable>
              <Pressable
                style={[styles.tab, formData.purchasedBy === 'client' && styles.activeTab]}
                onPress={() => setFormData(prev => ({ ...prev, purchasedBy: 'client' }))}
              >
                <Text style={[styles.tabText, formData.purchasedBy === 'client' && styles.activeTabText]}>Client</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Auto-renew</Text>
              <Text style={styles.switchDescription}>Enable automatic renewal payments</Text>
            </View>
            <Switch
              value={formData.autoRenew}
              onValueChange={(val) => setFormData(prev => ({ ...prev, autoRenew: val }))}
              trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
              thumbColor={formData.autoRenew ? '#4F46E5' : '#F9FAFB'}
            />
          </View>
        </View>

        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Domain Status</Text>
              <Pressable 
                style={styles.dropdownButton}
                onPress={() => setIsStatusModalOpen(true)}
              >
                <View style={styles.dropdownContent}>
                  <Text style={formData.status ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {titleCase(formData.status)}
                  </Text>
                </View>
                <ChevronDown size={18} color="#9CA3AF" />
              </Pressable>
            </View>
          </View>
        )}

        <Pressable 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>{isEditing ? 'Save Changes' : 'Add Domain'}</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Client Dropdown Modal */}
      <Modal visible={isClientModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsClientModalOpen(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Client</Text>
            <ScrollView style={styles.modalScroll}>
              {selectLoading ? (
                <View style={{ padding: 16 }}>
                  <ClientShimmer />
                  <ClientShimmer />
                </View>
              ) : (
                clients.map((client) => (
                  <Pressable
                    key={client._id || client.id}
                    style={styles.modalOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, clientId: client._id || client.id }));
                      setIsClientModalOpen(false);
                    }}
                  >
                    <Text style={[
                       styles.modalOptionText,
                       formData.clientId === (client._id || client.id) && { color: '#4F46E5', fontWeight: 'bold' }
                    ]}>
                      {client.company || client.companyName || client.name}
                    </Text>
                    {formData.clientId === (client._id || client.id) && <Check size={20} color="#4F46E5" />}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Vendor Dropdown Modal */}
      <Modal visible={isVendorModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsVendorModalOpen(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Vendor</Text>
            <ScrollView style={styles.modalScroll}>
              {selectLoading ? (
                <View style={{ padding: 16 }}>
                  <ClientShimmer />
                  <ClientShimmer />
                </View>
              ) : (
                vendors.map((vendor) => (
                  <Pressable
                    key={vendor._id || vendor.id}
                    style={styles.modalOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, vendorId: vendor._id || vendor.id }));
                      setIsVendorModalOpen(false);
                    }}
                  >
                    <Text style={[
                       styles.modalOptionText,
                       formData.vendorId === (vendor._id || vendor.id) && { color: '#4F46E5', fontWeight: 'bold' }
                    ]}>
                      {vendor.name}
                    </Text>
                    {formData.vendorId === (vendor._id || vendor.id) && <Check size={20} color="#4F46E5" />}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date Picker Modal (Native Only) */}
      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={formData.expiryDate ? new Date(formData.expiryDate) : new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* Status Dropdown Modal */}
      <Modal visible={isStatusModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsStatusModalOpen(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Status</Text>
            <ScrollView style={styles.modalScroll}>
              {['active', 'pending', 'inactive'].map((s) => (
                <Pressable
                  key={s}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, status: s }));
                    setIsStatusModalOpen(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.status === s && { color: '#4F46E5', fontWeight: 'bold' }
                  ]}>
                    {titleCase(s)}
                  </Text>
                  {formData.status === s && <Check size={20} color="#4F46E5" />}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Custom Toast */}
      {!!toastMessage && (
        <Animated.View 
          entering={FadeInUp} 
          exiting={FadeOutDown}
          style={styles.toastContainer}
        >
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    height: '100%',
  },
  inputTextOnly: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    fontSize: 15,
    color: '#111827',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#111827',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  inlineShimmer: {
    width: 140,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  switchDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
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
    minHeight: 300,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    padding: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
