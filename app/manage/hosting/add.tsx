import ClientShimmer from '@/components/ClientShimmer';
import { Text, View } from '@/components/Themed';
import { clientApi, hostingApi, vendorApi } from '@/lib/api';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  Briefcase,
  Building,
  Check,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  FileText,
  Globe,
  Link as LinkIcon,
  Save,
  Server
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput
} from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

export default function HostingFormScreen() {
  const { id, payload } = useLocalSearchParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(isEditing && !payload);
  const [toastMessage, setToastMessage] = useState('');

  // Dropdown data
  const [clients, setClients] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [selectLoading, setSelectLoading] = useState(true);
  const [domainLoading, setDomainLoading] = useState(false);
  
  // Modals for styling dropdown on iOS/Android
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isServiceTypeModalOpen, setIsServiceTypeModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    domainId: '',
    vendorId: '',
    serviceTypeId: '',
    renewalDate: '',
    monthlyCost: '',
    purchasedBy: 'kvtmedia',
    loginUrl: '',
    notes: '',
    status: 'active',
  });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const titleCase = (val: string) => {
    return String(val || '')
      .replace(/-/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setSelectLoading(true);
        const [clientsRes, vendorsRes, serviceTypesRes] = await Promise.all([
          clientApi.getClients({ limit: 100 }),
          vendorApi.getProviders(),
          hostingApi.getServiceTypes()
        ]);
        setClients(clientsRes.data || []);
        setVendors(Array.isArray(vendorsRes) ? vendorsRes : (vendorsRes.data || []));
        setServiceTypes(Array.isArray(serviceTypesRes) ? serviceTypesRes : (serviceTypesRes.data || []));
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      } finally {
        setSelectLoading(false);
      }
    };
    fetchSelectData();
  }, []);

  // Fetch Domains when Client changes
  useEffect(() => {
    const fetchClientDomains = async () => {
      if (!formData.clientId) {
        setDomains([]);
        return;
      }
      try {
        setDomainLoading(true);
        const response = await hostingApi.getClientDomains(formData.clientId);
        setDomains(response.data || response.domains || response || []);
      } catch (error) {
        console.error('Error fetching client domains:', error);
      } finally {
        setDomainLoading(false);
      }
    };
    fetchClientDomains();
  }, [formData.clientId]);

  const populateForm = (acc: any) => {
    const clientId = acc.client?._id || acc.client?.id || acc.client || acc.clientId || '';
          
    let resolvedVendorId = typeof acc.provider === 'string' ? acc.provider : acc.provider?._id || acc.provider?.id || '';
    let resolvedServiceTypeId = typeof acc.serviceType === 'string' ? acc.serviceType : acc.serviceType?._id || acc.serviceType?.id || '';

    setFormData({
      clientId: clientId,
      domainId: acc.domain?._id || acc.domain?.id || acc.domainId || (typeof acc.domain === 'string' ? acc.domain : ''),
      vendorId: resolvedVendorId,
      serviceTypeId: resolvedServiceTypeId,
      renewalDate: acc.renewalDate ? new Date(acc.renewalDate).toISOString().split('T')[0] : '',
      monthlyCost: acc.monthlyCost ? String(acc.monthlyCost) : '',
      purchasedBy: acc.purchasedBy || 'kvtmedia',
      loginUrl: acc.loginUrl || '',
      notes: acc.notes || '',
      status: acc.status === 'onhold' ? 'on-hold' : (acc.status || 'active'),
    });
  }

  useEffect(() => {
    const fetchHostingDetails = async () => {
      try {
        if (payload) {
          const acc = JSON.parse(payload as string);
          populateForm(acc);
          return;
        }

        setDataLoading(true);
        const response = await hostingApi.getHostingById(id as string);
        const acc = response?.data || response?.hosting || response;
        if (acc) populateForm(acc);
      } catch (error) {
        console.error('Error fetching hosting details:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (isEditing) {
      fetchHostingDetails();
    }
  }, [id, payload, isEditing]);

  const handleSave = async () => {
    if (!formData.clientId || !formData.domainId || !formData.vendorId || !formData.serviceTypeId || !formData.renewalDate || !formData.monthlyCost) {
      setToastMessage('Please fill all required fields (*) carefully.');
      setTimeout(() => setToastMessage(''), 2000);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        client: formData.clientId,
        domain: formData.domainId,
        provider: formData.vendorId, 
        serviceType: formData.serviceTypeId,
        renewalDate: formData.renewalDate,
        monthlyCost: parseFloat(formData.monthlyCost) || 0,
        purchasedBy: formData.purchasedBy,
        loginUrl: formData.loginUrl,
        notes: formData.notes,
        status: isEditing ? formData.status : 'active',
      };

      await hostingApi.saveHosting(id as string || null, payload);
      setToastMessage(`Hosting ${isEditing ? 'updated' : 'added'} successfully!`);
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      console.error('Error saving hosting:', error);
      setToastMessage('Failed to save hosting account. Please check your connection.');
      setTimeout(() => setToastMessage(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c._id === clientId || c.id === clientId);
    return client ? (client.company || client.companyName || client.name) : 'Select Client';
  };

  const getDomainName = (domainId: string) => {
    if (!formData.clientId) return 'Select a Client First';
    const domain = domains.find(d => d._id === domainId || d.id === domainId || d.name === domainId || d.domainName === domainId);
    return domain ? (domain.domainName || domain.name || domain.domain || domainId) : (domainId ? domainId : 'Select Domain');
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v._id === vendorId || v.id === vendorId);
    return vendor ? vendor.name : 'Select Provider';
  };

  const getServiceTypeName = (serviceTypeId: string) => {
    const type = serviceTypes.find(t => t._id === serviceTypeId || t.id === serviceTypeId);
    return type ? type.name : 'Select Hosting Type';
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
          title: isEditing ? 'Edit Hosting' : 'Add Hosting',
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
        {/* Connection Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link Details</Text>

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
            <Text style={styles.label}>Domain *</Text>
            <Pressable 
              style={[styles.dropdownButton, !formData.clientId && styles.dropdownDisabled]}
              onPress={() => formData.clientId ? setIsDomainModalOpen(true) : null}
            >
              <View style={styles.dropdownContent}>
                <Globe size={18} color="#9CA3AF" style={styles.inputIcon} />
                {domainLoading && !formData.domainId ? (
                  <View style={styles.inlineShimmer} />
                ) : (
                  <Text style={formData.domainId ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {getDomainName(formData.domainId)}
                  </Text>
                )}
              </View>
              <ChevronDown size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Infrastructure Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Infrastructure</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Provider (Vendor) *</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hosting Type *</Text>
            <Pressable 
              style={styles.dropdownButton}
              onPress={() => setIsServiceTypeModalOpen(true)}
            >
              <View style={styles.dropdownContent}>
                <Server size={18} color="#9CA3AF" style={styles.inputIcon} />
                {selectLoading && !formData.serviceTypeId ? (
                  <View style={styles.inlineShimmer} />
                ) : (
                  <Text style={formData.serviceTypeId ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {getServiceTypeName(formData.serviceTypeId)}
                  </Text>
                )}
              </View>
              <ChevronDown size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Renewal Date *</Text>
              <TextInput
                style={[styles.inputTextOnly]}
                placeholder="YYYY-MM-DD"
                value={formData.renewalDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, renewalDate: text }))}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Monthly Cost *</Text>
              <View style={styles.inputWrapper}>
                <CreditCard size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={formData.monthlyCost}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, monthlyCost: text }))}
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
        </View>

        {/* Credentials and Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extra Info</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Login URL</Text>
            <View style={styles.inputWrapper}>
              <LinkIcon size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="https://controlpanel..."
                value={formData.loginUrl}
                onChangeText={(text) => setFormData(prev => ({ ...prev, loginUrl: text }))}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start' }]}>
              <FileText size={18} color="#9CA3AF" style={[styles.inputIcon, { marginTop: 14 }]} />
              <TextInput
                style={[styles.input, { paddingTop: 14 }]}
                placeholder="Server details, FTP hints..."
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hosting Status</Text>
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
            <Text style={styles.submitButtonText}>{isEditing ? 'Save Changes' : 'Add Hosting Account'}</Text>
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
                      if (formData.clientId !== (client._id || client.id)) {
                         setFormData(prev => ({ ...prev, clientId: client._id || client.id, domainId: '' }));
                      }
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

      {/* Domain Dropdown Modal */}
      <Modal visible={isDomainModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsDomainModalOpen(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Domain</Text>
            <ScrollView style={styles.modalScroll}>
              {domainLoading ? (
                <View style={{ padding: 16 }}>
                  <ClientShimmer />
                  <ClientShimmer />
                </View>
              ) : domains.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>No domains found for this client.</Text>
              ) : (
                domains.map((domain) => {
                  const domId = domain._id || domain.id || domain.domainName || domain.name || domain;
                  const domName = domain.domainName || domain.name || domain.domain || domain;
                  return (
                    <Pressable
                      key={domId}
                      style={styles.modalOption}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, domainId: domId }));
                        setIsDomainModalOpen(false);
                      }}
                    >
                      <Text style={[
                         styles.modalOptionText,
                         formData.domainId === domId && { color: '#4F46E5', fontWeight: 'bold' }
                      ]}>
                        {domName}
                      </Text>
                      {formData.domainId === domId && <Check size={20} color="#4F46E5" />}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Vendor Dropdown Modal */}
      <Modal visible={isVendorModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsVendorModalOpen(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Provider</Text>
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

      {/* Service Type Dropdown Modal */}
      <Modal visible={isServiceTypeModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsServiceTypeModalOpen(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Hosting Type</Text>
            <ScrollView style={styles.modalScroll}>
              {selectLoading ? (
                <View style={{ padding: 16 }}>
                  <ClientShimmer />
                  <ClientShimmer />
                </View>
              ) : (
                serviceTypes.map((type) => (
                  <Pressable
                    key={type._id || type.id}
                    style={styles.modalOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, serviceTypeId: type._id || type.id }));
                      setIsServiceTypeModalOpen(false);
                    }}
                  >
                    <Text style={[
                       styles.modalOptionText,
                       formData.serviceTypeId === (type._id || type.id) && { color: '#4F46E5', fontWeight: 'bold' }
                    ]}>
                      {type.name}
                    </Text>
                    {formData.serviceTypeId === (type._id || type.id) && <Check size={20} color="#4F46E5" />}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Status Dropdown Modal */}
      <Modal visible={isStatusModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsStatusModalOpen(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Status</Text>
            <ScrollView style={styles.modalScroll}>
              {['active', 'pending', 'on-hold', 'completed'].map((s) => (
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
  dropdownDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
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
