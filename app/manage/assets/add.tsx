import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput, 
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { 
  Camera, 
  Save, 
  X, 
  ChevronDown, 
  Package, 
  FileText, 
  Tag, 
  DollarSign, 
  MapPin,
  Clock
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text, View } from '@/components/Themed';
import { mockAssets, Asset } from '@/constants/MockAssets';

export default function AssetFormScreen() {
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [form, setForm] = useState({
    assetName: '',
    type: 'Hardware',
    serialNumber: '',
    value: '',
    location: '',
    status: 'Available',
    description: '',
    image: null as string | null
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const asset = mockAssets.find(a => a.id === id);
      if (asset) {
        setForm({
          assetName: asset.assetName,
          type: asset.type,
          serialNumber: asset.serialNumber || '',
          value: asset.value || '',
          location: asset.location || '',
          status: asset.status,
          description: asset.description || '',
          image: null
        });
      }
    }
  }, [id, isEditing]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setForm(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleSave = () => {
    if (!form.assetName || !form.serialNumber) {
      Alert.alert('Error', 'Asset Name and Serial Number are required.');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        `Asset ${isEditing ? 'updated' : 'added'} successfully!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: isEditing ? 'Edit Asset' : 'Add New Asset',
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={loading} style={styles.saveButton}>
              {loading ? <ActivityIndicator size="small" color="#4F46E5" /> : <Save size={24} color="#4F46E5" />}
            </Pressable>
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Picker */}
        <Pressable style={styles.imageSection} onPress={pickImage}>
          {form.image ? (
            <Image source={{ uri: form.image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
                <Camera size={32} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>Add Asset Photo</Text>
            </View>
          )}
          {form.image && (
            <Pressable style={styles.removeImage} onPress={() => setForm(prev => ({ ...prev, image: null }))}>
                <X size={16} color="#FFF" />
            </Pressable>
          )}
        </Pressable>

        <View style={styles.formSection}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Asset Name *</Text>
                <View style={styles.inputWrapper}>
                    <Package size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. MacBook Pro, iPhone, etc."
                        value={form.assetName}
                        onChangeText={(text) => setForm(prev => ({ ...prev, assetName: text }))}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Asset Type *</Text>
                <View style={styles.typeSelector}>
                    {['Hardware', 'Software', 'Accessory'].map((type) => (
                        <Pressable 
                            key={type}
                            style={[styles.typeChip, form.type === type && styles.activeChip]}
                            onPress={() => setForm(prev => ({ ...prev, type }))}
                        >
                            <Text style={[styles.chipText, form.type === type && styles.activeChipText]}>{type}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Serial Number *</Text>
                    <View style={styles.inputWrapper}>
                        <Tag size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="SN-12345"
                            value={form.serialNumber}
                            onChangeText={(text) => setForm(prev => ({ ...prev, serialNumber: text }))}
                        />
                    </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Value</Text>
                    <View style={styles.inputWrapper}>
                        <DollarSign size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="2000"
                            keyboardType="numeric"
                            value={form.value}
                            onChangeText={(text) => setForm(prev => ({ ...prev, value: text }))}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputWrapper}>
                    <MapPin size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Bangalore HQ, Floor 3"
                        value={form.location}
                        onChangeText={(text) => setForm(prev => ({ ...prev, location: text }))}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusGrid}>
                    {['Available', 'Lent', 'Non Functional', 'Repairing'].map((status) => (
                        <Pressable 
                            key={status}
                            style={[styles.statusChip, form.status === status && styles.activeStatusChip]}
                            onPress={() => setForm(prev => ({ ...prev, status }))}
                        >
                            <Text style={[styles.chipText, form.status === status && styles.activeChipText]}>{status}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Asset details, specs, or special notes..."
                    multiline
                    numberOfLines={4}
                    value={form.description}
                    onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
                />
            </View>
        </View>

        <Pressable 
            style={[styles.submitButton, loading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <>
                    <Text style={styles.submitButtonText}>{isEditing ? 'Update Asset' : 'Save Asset'}</Text>
                    <Save size={20} color="#FFF" />
                </>
            )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  saveButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageSection: {
    height: 200,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative',
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImage: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
      height: 120,
      textAlignVertical: 'top',
      padding: 12,
      backgroundColor: '#FFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
  },
  typeSelector: {
      flexDirection: 'row',
      gap: 10,
  },
  typeChip: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: '#FFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 10,
  },
  statusGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
  },
  statusChip: {
      width: '48%',
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: '#FFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 10,
  },
  activeChip: {
      borderColor: '#4F46E5',
      backgroundColor: '#EEF2FF',
  },
  activeStatusChip: {
      borderColor: '#4F46E5',
      backgroundColor: '#EEF2FF',
  },
  chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#6B7280',
  },
  activeChipText: {
      color: '#4F46E5',
  },
  row: {
      flexDirection: 'row',
      gap: 16,
  },
  submitButton: {
      backgroundColor: '#4F46E5',
      marginHorizontal: 20,
      marginTop: 10,
      height: 56,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
  },
  disabledButton: {
      opacity: 0.7,
  },
  submitButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
  },
});
