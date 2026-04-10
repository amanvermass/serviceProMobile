import React from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  Clock, 
  Calendar, 
  User, 
  Tag, 
  FileText, 
  Edit3,
  BadgeAlert,
  Target,
  History,
  Info
} from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';
import { mockTasks } from '@/constants/MockPMS';

export default function PMSTaskDetailsScreen() {
  const { id } = useLocalSearchParams();
  const task = mockTasks.find(t => t.id === id);

  if (!task) {
    return (
      <View style={styles.center}>
        <Text>Task not found</Text>
      </View>
    );
  }

  const isHighPriority = task.priority === 'high' || task.priority === 'critical';

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Task Details',
          headerRight: () => (
            <Pressable onPress={() => {}} style={styles.headerBtn}>
              <Edit3 size={22} color="#4F46E5" />
            </Pressable>
          )
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Header */}
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <Text style={styles.taskCode}>{task.code}</Text>
                <StatusBadge type={task.status === 'in-progress' ? 'pending' : task.status as any} />
            </View>
            <Text style={styles.taskTitle}>{task.taskDescription}</Text>
            <View style={styles.projectRow}>
                <Target size={14} color="#6B7280" />
                <Text style={styles.projectName}>{task.project}</Text>
            </View>
        </View>

        {/* Metrics Bar */}
        <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
                <Clock size={16} color="#6366F1" />
                <View>
                    <Text style={styles.metricLabel}>Time Logged</Text>
                    <Text style={styles.metricValue}>{task.hoursSpent}h / {task.estimatedTime}</Text>
                </View>
            </View>
            <View style={[styles.metricItem, { borderLeftWidth: 1, borderLeftColor: '#F3F4F6' }]}>
                <BadgeAlert size={16} color={isHighPriority ? '#EF4444' : '#F59E0B'} />
                <View>
                    <Text style={styles.metricLabel}>Priority</Text>
                    <Text style={[styles.metricValue, { textTransform: 'capitalize', color: isHighPriority ? '#EF4444' : '#111827' }]}>{task.priority}</Text>
                </View>
            </View>
        </View>

        {/* Main Info */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Info size={18} color="#4F46E5" />
                <Text style={styles.sectionTitle}>General Information</Text>
            </View>
            <View style={styles.infoCard}>
                <InfoRow label="Assigned To" value={task.assignedTo.name} icon={<User size={16} color="#4F46E5" />} />
                <InfoRow label="Category" value={task.category} icon={<Tag size={16} color="#4F46E5" />} />
                <InfoRow label="Start Date" value={task.taskDate} icon={<Calendar size={16} color="#4F46E5" />} />
                <InfoRow label="Due Date" value={task.dueDate} icon={<Calendar size={16} color="#F59E0B" />} />
            </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <FileText size={18} color="#4F46E5" />
                <Text style={styles.sectionTitle}>Full Description</Text>
            </View>
            <View style={styles.descriptionCard}>
                <Text style={styles.descriptionText}>
                    This task involves {task.taskDescription.toLowerCase()} within the {task.project} scope. 
                    {'\n\n'}
                    Key requirements include ensuring code quality, adhering to the project's design system, and maintaining responsiveness across all mobile viewports.
                    Please update the status as you progress and log hours daily.
                </Text>
            </View>
        </View>

        {/* History / Activity Placeholder */}
        <View style={styles.section}>
             <View style={styles.sectionHeader}>
                <History size={18} color="#4F46E5" />
                <Text style={styles.sectionTitle}>Activity History</Text>
            </View>
            <View style={styles.activityCard}>
                 <ActivityItem user="Admin" action="Task created" time="04-04-2026" />
                 <ActivityItem user={task.assignedTo.avatar} action="Task assigned to" detail={task.assignedTo.name} time="04-04-2026" />
                 {task.status === 'completed' && <ActivityItem user={task.assignedTo.avatar} action="Task marked as" detail="Completed" time={task.taskDate} />}
            </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
          <Pressable style={styles.primaryBtn} onPress={() => {}}>
              <Text style={styles.primaryBtnText}>Log Hours</Text>
          </Pressable>
      </View>
    </View>
  );
}

function InfoRow({ label, value, icon }: any) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>{icon}</View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

function ActivityItem({ user, action, detail, time }: any) {
    return (
        <View style={styles.activityItem}>
            <View style={styles.activityAvatar}>
                <Text style={styles.activityAvatarText}>{user}</Text>
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                    <Text style={{ fontWeight: '700' }}>{user}</Text> {action} {detail && <Text style={{ fontWeight: '700' }}>{detail}</Text>}
                </Text>
                <Text style={styles.activityTime}>{time}</Text>
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
  scrollContent: {
    paddingBottom: 100,
  },
  headerBtn: {
    padding: 8,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 1,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
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
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 1,
  },
  descriptionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 20,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    height: 52,
    borderRadius: 12,
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
