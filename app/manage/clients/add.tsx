import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  Switch, 
  Alert,
  Modal
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  ChevronLeft, 
  Save, 
  Building, 
  User, 
  Globe, 
  Mail, 
  Phone, 
  MessageSquare, 
  Type,
  Plus,
  ChevronDown,
  Check,
  X
} from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { clientApi } from '@/lib/api';

export default function ClientFormScreen() {
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    name: '',
    email: '',
    alternateEmail: '',
    phone: '',
    category: '',
    status: 'active',
    notes: '',
    communicationPreferences: {
      email: true,
      sms: false,
      whatsapp: false
    }
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchClientDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await clientApi.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setFetchingCategories(false);
    }
  };

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getClientById(id as string);
      const client = response?.data || response?.client || response;
      if (client) {
        setFormData({
          companyName: client.company || client.companyName || '',
          website: client.website || '',
          name: client.name || client.primaryContact?.name || '',
          email: client.email || client.primaryContact?.email || '',
          alternateEmail: client.alternateEmail || '',
          phone: client.phone || client.primaryContact?.phone || '',
          category: client.category?._id || client.category?.id || client.category || '',
          status: client.status || 'active',
          notes: client.notes || '',
          communicationPreferences: client.communicationPreferences || { email: true, sms: false, whatsapp: false }
        });
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.companyName || !formData.name || !formData.email) {
      Alert.alert('Required Fields', 'Please fill in Company Name, Contact Name, and Email.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        company: formData.companyName, // Ensure the DB gets the correct key
      };
      await clientApi.saveClient(id as string || null, payload);
      setToastMessage(`Client ${isEditing ? 'updated' : 'added'} successfully!`);
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      console.error('Error saving client:', error);
      Alert.alert('Error', 'Failed to save client. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof typeof formData.communicationPreferences) => {
    setFormData(prev => ({
      ...prev,
      communicationPreferences: {
        ...prev.communicationPreferences,
        [key]: !prev.communicationPreferences[key]
      }
    }));
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
          title: isEditing ? 'Edit Client' : 'Add New Client',
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
        {/* Business Section */}
        <FormSection title="Business Information" icon={Building}>
          <FormInput 
            label="Company Name" 
            value={formData.companyName} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, companyName: txt }))}
            placeholder="e.g. TechCorp Solutions"
            required
          />
          <FormInput 
            label="Website" 
            value={formData.website} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, website: txt }))}
            placeholder="company.com"
            autoCapitalize="none"
          />
        </FormSection>

        {/* Contact Section */}
        <FormSection title="Primary Contact" icon={User}>
          <FormInput 
            label="Contact Name" 
            value={formData.name} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, name: txt }))}
            placeholder="John Doe"
            required
          />
          <FormInput 
            label="Email Address" 
            value={formData.email} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, email: txt }))}
            placeholder="john@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
          <FormInput 
            label="Phone Number" 
            value={formData.phone} 
            onChangeText={(txt: string) => setFormData(p => ({ ...p, phone: txt }))}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
          />
        </FormSection>

        {/* Categories & Status */}
        <FormSection title="Categorization" icon={Type}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <Pressable 
              style={styles.dropdownButton}
              onPress={() => setIsCategoryModalOpen(true)}
            >
              <Text style={[styles.dropdownButtonText, !formData.category && { color: '#9CA3AF' }]}>
                {formData.category && categories.length > 0 
                  ? (categories.find(c => (c._id || c.id) === formData.category)?.name || 'Select Category') 
                  : 'Select Category'}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </Pressable>
          </View>

          {isEditing && (
            <View style={[styles.row, { marginTop: 16 }]}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Client Status</Text>
              <View style={styles.statusToggle}>
                {['active', 'pending', 'inactive'].map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setFormData(p => ({ ...p, status: s }))}
                    style={[styles.statusTab, formData.status === s && styles.statusTabActive]}
                  >
                    <Text style={[styles.statusTabText, formData.status === s && styles.statusTabActiveText]}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </FormSection>

        {/* Preferences */}
        <FormSection title="Communication" icon={MessageSquare}>
          <PreferenceItem 
            label="Email Notifications" 
            value={formData.communicationPreferences.email} 
            onToggle={() => updatePreference('email')} 
          />
          <PreferenceItem 
            label="SMS Alerts" 
            value={formData.communicationPreferences.sms} 
            onToggle={() => updatePreference('sms')} 
          />
          <PreferenceItem 
            label="WhatsApp Messages" 
            value={formData.communicationPreferences.whatsapp} 
            onToggle={() => updatePreference('whatsapp')} 
          />
        </FormSection>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(txt) => setFormData(p => ({ ...p, notes: txt }))}
            placeholder="Add internal notes about this client..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Update Client' : 'Add Client'}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Category Dropdown Modal */}
      <Modal
        visible={isCategoryModalOpen}
        transparent
        animationType="fade"
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsCategoryModalOpen(false)}
        >
          <Pressable style={styles.dropdownModalContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Category</Text>
              <Pressable onPress={() => setIsCategoryModalOpen(false)}>
                <X size={20} color="#6B7280" />
              </Pressable>
            </View>
            {fetchingCategories ? (
              <ActivityIndicator size="small" color="#4F46E5" style={{ margin: 20 }} />
            ) : (
              <ScrollView style={styles.dropdownList}>
                {categories.map((cat) => {
                  const catId = cat._id || cat.id;
                  return (
                    <Pressable
                      key={catId}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setFormData(p => ({ ...p, category: catId }));
                        setIsCategoryModalOpen(false);
                      }}
                    >
                      <Text style={[styles.dropdownOptionText, formData.category === catId && styles.dropdownOptionTextActive]}>
                        {cat.name}
                      </Text>
                      {formData.category === catId && <Check size={18} color="#4F46E5" />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Internal Custom Toast */}
      {!!toastMessage && (
        <Animated.View 
          entering={FadeInUp} 
          exiting={FadeOutDown}
          style={styles.toastContainer}
        >
          <View style={styles.toast}>
            <Check size={20} color="#10B981" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
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

function PreferenceItem({ label, value, onToggle }: any) {
  return (
    <View style={styles.preferenceItem}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ true: '#4F46E5', false: '#E5E7EB' }} />
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
  textArea: {
    height: 100,
    paddingTop: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dropdownModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  dropdownList: {
    paddingHorizontal: 10,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  dropdownOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  dropdownOptionTextActive: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
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
    color: '#9CA3AF',
  },
  statusTabActiveText: {
    color: '#4F46E5',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#4B5563',
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
    gap: 10,
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
