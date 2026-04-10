import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput, 
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { 
  Save, 
  X, 
  ChevronDown, 
  Calendar as CalendarIcon,
  User,
  Briefcase,
  Type,
  Check
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, View } from '@/components/Themed';
import { mockPMSEmployees, mockPMSProjects, mockTasks } from '@/constants/MockPMS';

export default function PMSAddEditScreen() {
  const { id } = useLocalSearchParams();
  const taskToEdit = id ? mockTasks.find(t => t.id === id) : null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: taskToEdit?.taskDescription || '',
    project: taskToEdit?.project || '',
    category: taskToEdit?.category || 'Development',
    resource: taskToEdit?.assignedTo.name || '',
    priority: taskToEdit?.priority || 'medium',
    startDate: taskToEdit ? new Date(taskToEdit.taskDate) : new Date(),
    dueDate: taskToEdit ? new Date(taskToEdit.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  const handleSubmit = () => {
    if (!formData.title || !formData.project || !formData.resource) {
      Alert.alert('Error', 'Please fill all required fields (*)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        `Task "${formData.title}" has been ${taskToEdit ? 'updated' : 'created'} successfully.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: taskToEdit ? 'Edit Task' : 'New Task',
          headerRight: () => (
            <Pressable onPress={handleSubmit} disabled={loading} style={styles.headerBtn}>
              {loading ? <ActivityIndicator size="small" color="#4F46E5" /> : <Save size={24} color="#4F46E5" />}
            </Pressable>
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
            {/* Title */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Task Title *</Text>
                <View style={styles.inputWrapper}>
                    <Type size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="What needs to be done?"
                        value={formData.title}
                        onChangeText={(v) => setFormData({...formData, title: v})}
                    />
                </View>
            </View>

            {/* Project */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Project *</Text>
                <Pressable style={styles.selector} onPress={() => setIsProjectModalOpen(true)}>
                    <View style={styles.selectorLeft}>
                        <Briefcase size={18} color="#9CA3AF" />
                        <Text style={[styles.selectorText, !formData.project && { color: '#9CA3AF' }]}>
                            {formData.project || 'Select Project'}
                        </Text>
                    </View>
                    <ChevronDown size={18} color="#6B7280" />
                </Pressable>
            </View>

            {/* Resource */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Assigned To *</Text>
                <Pressable style={styles.selector} onPress={() => setIsResourceModalOpen(true)}>
                    <View style={styles.selectorLeft}>
                        <User size={18} color="#9CA3AF" />
                        <Text style={[styles.selectorText, !formData.resource && { color: '#9CA3AF' }]}>
                            {formData.resource || 'Assign resource'}
                        </Text>
                    </View>
                    <ChevronDown size={18} color="#6B7280" />
                </Pressable>
            </View>

            {/* Dates Row */}
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Start Date</Text>
                    <Pressable style={styles.dateBtn} onPress={() => setShowStartDatePicker(true)}>
                        <CalendarIcon size={16} color="#4F46E5" />
                        <Text style={styles.dateText}>{formData.startDate.toLocaleDateString()}</Text>
                    </Pressable>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Due Date</Text>
                    <Pressable style={styles.dateBtn} onPress={() => setShowDueDatePicker(true)}>
                        <CalendarIcon size={16} color="#EF4444" />
                        <Text style={styles.dateText}>{formData.dueDate.toLocaleDateString()}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Priority & Category Row */}
             <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Priority</Text>
                    <select
                        style={styles.simpleSelect}
                        value={formData.priority}
                        onChange={(e: any) => setFormData({...formData, priority: e.target.value})}
                    >
                         <option value="low">Low</option>
                         <option value="medium">Medium</option>
                         <option value="high">High</option>
                         <option value="critical">Critical</option>
                    </select>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Category</Text>
                    <select
                        style={styles.simpleSelect}
                        value={formData.category}
                        onChange={(e: any) => setFormData({...formData, category: e.target.value})}
                    >
                         <option value="Development">Development</option>
                         <option value="Design">Design</option>
                         <option value="Backend">Backend</option>
                         <option value="Testing">Testing</option>
                    </select>
                </View>
            </View>
        </View>

        <Pressable 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
        >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>{taskToEdit ? 'Save Changes' : 'Create Task'}</Text>}
        </Pressable>
      </ScrollView>

      {/* Select Modals (Simplified for brevity, similar to Personnel modal in lend.tsx) */}
      <SelectionModal 
        visible={isProjectModalOpen} 
        title="Select Project" 
        options={mockPMSProjects} 
        selected={formData.project}
        onSelect={(p: string) => { setFormData({...formData, project: p}); setIsProjectModalOpen(false); }}
        onClose={() => setIsProjectModalOpen(false)}
      />

       <SelectionModal 
        visible={isResourceModalOpen} 
        title="Assign Resource" 
        options={mockPMSEmployees.map(e => e.name)} 
        selected={formData.resource}
        onSelect={(r: string) => { setFormData({...formData, resource: r}); setIsResourceModalOpen(false); }}
        onClose={() => setIsResourceModalOpen(false)}
      />

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          onChange={(e, date) => { setShowStartDatePicker(false); if (date) setFormData({...formData, startDate: date}); }}
        />
      )}
      {showDueDatePicker && (
        <DateTimePicker
          value={formData.dueDate}
          mode="date"
          onChange={(e, date) => { setShowDueDatePicker(false); if (date) setFormData({...formData, dueDate: date}); }}
        />
      )}
    </View>
  );
}

function SelectionModal({ visible, title, options, selected, onSelect, onClose }: any) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <Pressable onPress={onClose}><X size={22} color="#6B7280" /></Pressable>
                    </View>
                    <ScrollView>
                        {options.map((opt: string) => (
                            <Pressable 
                                key={opt} 
                                style={styles.optItem}
                                onPress={() => onSelect(opt)}
                            >
                                <Text style={[styles.optText, selected === opt && { color: '#4F46E5', fontWeight: 'bold' }]}>{opt}</Text>
                                {selected === opt && <Check size={18} color="#4F46E5" />}
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
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
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorText: {
    fontSize: 16,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 50,
  },
  dateText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  simpleSelect: {
    height: 50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
  },
  submitBtn: {
    marginTop: 32,
    backgroundColor: '#4F46E5',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnText: {
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
    maxHeight: '70%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  optItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth:1,
    borderBottomColor: '#F3F4F6',
  },
  optText: {
    fontSize: 16,
    color: '#374151',
  },
});
