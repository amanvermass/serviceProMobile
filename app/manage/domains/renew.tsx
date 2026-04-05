import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput, 
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  ChevronLeft, 
  Save, 
  Globe, 
  CreditCard,
  MessageSquare,
  Calendar
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Text, View } from '@/components/Themed';
import { domainApi } from '@/lib/api';

export default function RenewDomainScreen() {
  const { id, name, expiryDate } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    renewalDate: expiryDate ? new Date(expiryDate as string).toISOString().split('T')[0] : '',
    cost: '',
    remark: '',
  });

  const handleSave = async () => {
    if (!formData.renewalDate || !formData.cost) {
      setToastMessage('Please fill both Date and Cost.');
      setTimeout(() => setToastMessage(''), 2000);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        expiryDate: formData.renewalDate,
        cost: parseFloat(formData.cost) || 0,
        remark: formData.remark,
      };

      await domainApi.renewDomain(id as string, payload);
      setToastMessage(`Domain renewed successfully!`);
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      console.error('Error renewing domain:', error);
      setToastMessage('Failed to renew domain. Please check your connection.');
      setTimeout(() => setToastMessage(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Renew Domain',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
              <ChevronLeft size={24} color="#111827" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={loading} style={styles.headerButton}>
              {loading ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Save size={20} color="#059669" />
              )}
            </Pressable>
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBlock}>
          <Globe size={40} color="#059669" style={styles.headerIcon} />
          <Text style={styles.domainName}>{name}</Text>
          <Text style={styles.subtitle}>Current Expiry: {expiryDate ? new Date(expiryDate as string).toLocaleDateString() : 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Renewal Date *</Text>
            <View style={styles.inputWrapper}>
              <Calendar size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.renewalDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, renewalDate: text }))}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Renewal Cost *</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remarks (Optional)</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <MessageSquare size={18} color="#9CA3AF" style={[styles.inputIcon, { marginTop: 14 }]} />
              <TextInput
                style={styles.textArea}
                placeholder="Add any notes about this renewal..."
                value={formData.remark}
                onChangeText={(text) => setFormData(prev => ({ ...prev, remark: text }))}
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <Pressable 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Process Renewal</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Custom Toast */}
      {!!toastMessage && (
        <Animated.View 
          entering={FadeInUp} 
          exiting={FadeOutDown}
          style={styles.toastContainer}
        >
          <View style={[styles.toast, { backgroundColor: toastMessage.includes('Failed') ? '#EF4444' : '#059669' }]}>
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
  headerButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  headerIcon: {
    marginBottom: 12,
  },
  domainName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
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
  textAreaWrapper: {
    height: 100,
    alignItems: 'flex-start',
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
  textArea: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    height: '100%',
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: '#059669',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
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
