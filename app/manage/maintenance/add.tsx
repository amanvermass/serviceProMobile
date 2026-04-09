import ClientShimmer from '@/components/ClientShimmer';
import { Text, View } from '@/components/Themed';
import { clientApi, maintenanceApi } from '@/lib/api';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Briefcase, Calendar, Check, ChevronDown, ChevronLeft, Save, Type, Users } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, View as RNView, ScrollView, StyleSheet, TextInput } from 'react-native';

export default function MaintenanceFormScreen() {
  const { id, payload } = useLocalSearchParams() as { id?: string; payload?: string };
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectLoading, setSelectLoading] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    projectName: '',
    amcStartDate: '',
    amcEndDate: '',
    amcValue: '',
    billingFrequency: 'monthly',
    freeChangesLimit: '5',
    status: 'active',
  });

  const durationDays = useMemo(() => {
    if (!formData.amcStartDate || !formData.amcEndDate) return '';
    const start = new Date(formData.amcStartDate).getTime();
    const end = new Date(formData.amcEndDate).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '';
    return String(Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }, [formData.amcStartDate, formData.amcEndDate]);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setSelectLoading(true);
        const resp = await clientApi.getClients({ limit: 100 });
        setClients(resp.data || []);
      } catch (e) {
      } finally {
        setSelectLoading(false);
      }
    };
    fetchSelectData();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isEditing) return;
      try {
        setLoading(true);
        const resp = await maintenanceApi.getMaintenanceById(id as string);
        const item = resp.data || resp.maintenance || resp;
        if (item) prefillFromItem(item);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (!payload) return;
    try {
      const parsed = JSON.parse(String(payload));
      if (parsed && typeof parsed === 'object') {
        prefillFromItem(parsed);
      }
    } catch {}
  }, [payload]);

  const toYMD = (val: string | Date | undefined) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
    };

  const prefillFromItem = (item: any) => {
    setFormData({
      clientId: item.client?._id || item.clientId || item.client || '',
      projectName: item.projectName || item.name || '',
      amcStartDate: toYMD(item.amcStartDate || item.startDate),
      amcEndDate: toYMD(item.amcEndDate || item.endDate),
      amcValue: String(item.monthlyValue ?? item.amcValue ?? ''),
      billingFrequency: 'monthly',
      freeChangesLimit: String(item.freeChangesLimit ?? item.freeChanges?.total ?? '5'),
      status: item.status === 'onhold' ? 'on-hold' : (item.status || 'active'),
    });
  };

  const titleCase = (val: string) => {
    return String(val || '')
      .replace(/-/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const calcMonthlyValue = (val: number, freq: string) => {
    if (!val || val <= 0) return 0;
    switch (freq) {
      case 'daily': return val * 30;
      case 'weekly': return (val * 52) / 12;
      case 'by-weekly': return (val * 26) / 12;
      case 'quarterly': return val / 3;
      case 'half-yearly': return val / 6;
      case 'yearly': return val / 12;
      default: return val;
    }
  };

  const handleSave = async () => {
    if (!formData.clientId || !formData.projectName || !formData.amcStartDate || !formData.amcEndDate || !formData.amcValue) {
      Alert.alert('Required Fields', 'Please fill in all required fields.');
      return;
    }
    try {
      setLoading(true);
      const amcValueNum = Number(formData.amcValue || 0);
      const monthlyValue = calcMonthlyValue(amcValueNum, formData.billingFrequency);
      const payload: any = {
        client: formData.clientId,
        projectName: formData.projectName,
        amcStartDate: formData.amcStartDate,
        amcEndDate: formData.amcEndDate,
        monthlyValue,
        freeChangesLimit: Number(formData.freeChangesLimit || 0),
        status: isEditing ? (formData.status === 'on-hold' ? 'onhold' : formData.status) : 'active',
      };
      await maintenanceApi.saveMaintenance(isEditing ? (id as string) : null, payload);
      setToastMessage(`Maintenance ${isEditing ? 'updated' : 'added'} successfully!`);
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (e) {
      Alert.alert('Error', 'Failed to save maintenance.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: isEditing ? 'Edit Maintenance' : 'Add Maintenance',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#111827" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={loading} style={styles.saveButton}>
              {loading ? <ActivityIndicator size="small" color="#4F46E5" /> : <Save size={24} color="#4F46E5" />}
            </Pressable>
          )
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <FormSection title="Project" icon={Briefcase}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client</Text>
            <Pressable 
              style={styles.dropdownButton}
              onPress={() => setIsClientModalOpen(true)}
            >
              {selectLoading && !formData.clientId ? (
                <RNView style={styles.inlineShimmer} />
              ) : (
                <Text style={[styles.dropdownButtonText, !formData.clientId && { color: '#9CA3AF' }]}>
                  {formData.clientId && clients.length > 0 
                    ? (clients.find(c => (c._id || c.id) === formData.clientId)?.company || clients.find(c => (c._id || c.id) === formData.clientId)?.name || 'Select Client') 
                    : 'Select Client'}
                </Text>
              )}
              <ChevronDown size={20} color="#6B7280" />
            </Pressable>
          </View>
          <FormInput 
            label="Project Name" 
            value={formData.projectName} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, projectName: txt }))}
            placeholder="e.g. Corporate Website AMC"
            required
          />
        </FormSection>

        <FormSection title="AMC Period" icon={Calendar}>
          <FormInput 
            label="Start Date" 
            value={formData.amcStartDate} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, amcStartDate: txt }))}
            placeholder="YYYY-MM-DD"
            required
          />
          <FormInput 
            label="End Date" 
            value={formData.amcEndDate} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, amcEndDate: txt }))}
            placeholder="YYYY-MM-DD"
            required
          />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (Days)</Text>
            <TextInput style={styles.input} editable={false} value={durationDays} placeholderTextColor="#9CA3AF" />
          </View>
        </FormSection>

        <FormSection title="Billing" icon={Type}>
          <FormInput 
            label="AMC Value" 
            value={formData.amcValue} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, amcValue: txt.replace(/[^0-9.]/g, '') }))}
            placeholder="e.g. 2500"
            keyboardType="numeric"
            required
          />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Billing Frequency</Text>
            <View style={styles.statusToggle}>
              {['daily','weekly','by-weekly','monthly','quarterly','half-yearly','yearly'].map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setFormData(p => ({ ...p, billingFrequency: s }))}
                  style={[styles.statusTab, formData.billingFrequency === s && styles.statusTabActive]}
                >
                  <Text style={[styles.statusTabText, formData.billingFrequency === s && styles.statusTabActiveText]}>
                    {titleCase(s)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <FormInput 
            label="Free Changes Limit (Monthly)" 
            value={formData.freeChangesLimit} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, freeChangesLimit: txt.replace(/[^0-9]/g, '') }))}
            placeholder="e.g. 5"
            keyboardType="numeric"
            required
          />
        </FormSection>

        {isEditing && (
          <FormSection title="Status" icon={Users}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <Pressable 
                style={styles.dropdownButton}
                onPress={() => setIsStatusModalOpen(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {titleCase(formData.status)}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </Pressable>
            </View>
          </FormSection>
        )}

        <Pressable 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Update Maintenance' : 'Add Maintenance'}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal visible={isClientModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setIsClientModalOpen(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Client</Text>
            <ScrollView style={styles.modalScroll}>
              {selectLoading ? (
                <RNView style={{ padding: 16 }}>
                  <ClientShimmer />
                  <ClientShimmer />
                </RNView>
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
                      {client.company || client.name}
                    </Text>
                    {formData.clientId === (client._id || client.id) && <Check size={20} color="#4F46E5" />}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
    </View>
  );
}

function FormSection({ title, icon: Icon, children }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon size={18} color="#4F46E5" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function FormInput({ label, required, ...props }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
      </Text>
      <TextInput style={styles.input} {...props} placeholderTextColor="#9CA3AF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  saveButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  sectionContent: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111827',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#111827',
  },
  inlineShimmer: {
    width: 120,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  statusToggle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    gap: 6,
  },
  statusTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  statusTabActiveText: {
    color: '#4F46E5',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalScroll: {
    paddingHorizontal: 10,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#374151',
  },
});
