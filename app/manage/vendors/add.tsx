import { Text, View } from '@/components/Themed';
import { vendorApi } from '@/lib/api';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  Briefcase,
  ChevronLeft,
  Globe,
  Save,
  Trash2,
  UploadCloud
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput
} from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

export default function VendorFormScreen() {
  const { id, payload } = useLocalSearchParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(isEditing && !payload);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    type: 'both',
    status: 'active',
  });

  // Image State
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<any>(null); // For upload

  useEffect(() => {
    if (isEditing) {
      try {
        if (payload) {
          const vendor = JSON.parse(payload as string);
          setFormData({
            name: vendor.name || '',
            website: vendor.website || '',
            type: vendor.type || 'both',
            status: vendor.status || 'active',
          });

          if (vendor.logo && (vendor.logo.startsWith('/') || vendor.logo.startsWith('http'))) {
            setSelectedLogo(
              vendor.logo.startsWith('http') ? vendor.logo : `${process.env.EXPO_PUBLIC_API_URL || 'https://domainapi.kvtmedia.com'}${vendor.logo}`
            );
          }
        }
      } catch (error) {
        console.error('Error parsing vendor payload:', error);
      } finally {
        setDataLoading(false);
      }
    }
  }, [id, payload, isEditing]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedLogo(asset.uri);
        setLogoFile(asset);
      }
    } catch (error) {
      console.error('Error picking image', error);
      setToastMessage('Could not select image.');
      setTimeout(() => setToastMessage(''), 2000);
    }
  };

  const clearImage = () => {
    setSelectedLogo(null);
    setLogoFile(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.website || !formData.type) {
      setToastMessage('Please fill all required fields(*).');
      setTimeout(() => setToastMessage(''), 2000);
      return;
    }

    try {
      setLoading(true);

      const apiFormData = new FormData();
      apiFormData.append("name", formData.name);
      apiFormData.append("type", formData.type);
      apiFormData.append("status", formData.status);

      let websiteClean = formData.website.replace(/`/g, "").trim().replace(/^['"]+|['"]+$/g, "");
      const finalWebsite = websiteClean ? /^https?:\/\//i.test(websiteClean) ? websiteClean : `https://${websiteClean}` : "";
      if (finalWebsite) apiFormData.append("website", finalWebsite);

      if (logoFile) {
        if (Platform.OS === 'web') {
          // Expo web returns a blob URI
          const response = await fetch(logoFile.uri);
          const blob = await response.blob();
          apiFormData.append('logo', blob, 'logo.jpg');
        } else {
          const filename = logoFile.uri.split('/').pop() || 'logo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;

          apiFormData.append('logo', {
            uri: logoFile.uri,
            name: filename,
            type: type
          } as any);
        }
      }

      await vendorApi.saveProvider(id as string || null, apiFormData);

      setToastMessage(`Vendor ${isEditing ? 'updated' : 'added'} successfully!`);
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error: any) {
      console.error('Error saving vendor:', error);
      setToastMessage(error.message || 'Failed to save vendor. Check your connection.');
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setLoading(false);
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
          title: isEditing ? 'Edit Vendor' : 'Add Vendor',
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
        {/* Core Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vendor Name *</Text>
            <View style={styles.inputWrapper}>
              <Briefcase size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="e.g. GoDaddy"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website URL *</Text>
            <View style={styles.inputWrapper}>
              <Globe size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="e.g. godaddy.com"
                value={formData.website}
                onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>
        </View>

        {/* Categorization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Type</Text>

          <View style={styles.tabsContainer}>
            <Pressable
              style={[styles.tab, formData.type === 'domain' && styles.activeTab]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'domain' }))}
            >
              <Text style={[styles.tabText, formData.type === 'domain' && styles.activeTabText]}>Domain</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, formData.type === 'hosting' && styles.activeTab]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'hosting' }))}
            >
              <Text style={[styles.tabText, formData.type === 'hosting' && styles.activeTabText]}>Hosting</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, formData.type === 'both' && styles.activeTab]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'both' }))}
            >
              <Text style={[styles.tabText, formData.type === 'both' && styles.activeTabText]}>Both</Text>
            </Pressable>
          </View>

          {isEditing && (
            <View style={[styles.inputGroup, { marginTop: 24 }]}>
              <Text style={styles.label}>Vendor Status</Text>
              <View style={styles.tabsContainer}>
                <Pressable
                  style={[styles.tab, formData.status === 'active' && styles.activeTab]}
                  onPress={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                >
                  <Text style={[styles.tabText, formData.status === 'active' && { color: '#10B981' }]}>Active</Text>
                </Pressable>
                <Pressable
                  style={[styles.tab, formData.status === 'inactive' && styles.activeTab]}
                  onPress={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                >
                  <Text style={[styles.tabText, formData.status === 'inactive' && { color: '#EF4444' }]}>Inactive</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Logo Media Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Logo</Text>
          <View style={styles.logoPickerContainer}>
            {selectedLogo ? (
              <View style={styles.selectedLogoWrapper}>
                <Image source={{ uri: selectedLogo }} style={styles.previewLogo} resizeMode="contain" />
                <Pressable style={styles.removeImageBtn} onPress={clearImage}>
                  <Trash2 size={16} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.uploadBox} onPress={pickImage}>
                <UploadCloud size={32} color="#9CA3AF" />
                <Text style={styles.uploadTextBold}>Click to upload logo</Text>
                <Text style={styles.uploadTextHint}>SVG, PNG, JPG (Max 2MB)</Text>
              </Pressable>
            )}
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
            <Text style={styles.submitButtonText}>{isEditing ? 'Save Changes' : 'Add Vendor'}</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Toast Notification */}
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
    color: '#4F46E5',
  },
  logoPickerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBox: {
    width: '100%',
    height: 140,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 8,
  },
  uploadTextHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  selectedLogoWrapper: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  previewLogo: {
    width: '90%',
    height: '90%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
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
