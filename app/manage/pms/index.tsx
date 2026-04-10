import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  Pressable, 
  TextInput, 
  ScrollView,
  Dimensions
} from 'react-native';
import { router, Stack } from 'expo-router';
import { 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase,
  ChevronRight,
  Filter,
  X,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';
import { mockTasks, PMS_Task } from '@/constants/MockPMS';

export default function PMSDashboardScreen() {
  const [tasks, setTasks] = useState<PMS_Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status !== 'completed').length,
      hours: tasks.reduce((sum, t) => sum + t.hoursSpent, 0)
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.taskDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, tasks]);

  const renderTaskItem = ({ item, index }: { item: PMS_Task, index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)}>
      <Pressable 
        style={styles.taskCard}
        onPress={() => router.push(`/manage/pms/${item.id}`)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.codeContainer}>
            <Text style={styles.taskCode}>{item.code}</Text>
            {item.priority === 'high' && (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>High</Text>
              </View>
            )}
          </View>
          <StatusBadge type={item.status === 'in-progress' ? 'pending' : item.status as any} />
        </View>

        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.taskDescription}
        </Text>

        <View style={styles.projectInfo}>
          <Briefcase size={14} color="#6B7280" />
          <Text style={styles.projectText}>{item.project}</Text>
        </View>

        <View style={styles.taskFooter}>
          <View style={styles.assignee}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.assignedTo.avatar}</Text>
            </View>
            <Text style={styles.assigneeName}>{item.assignedTo.name}</Text>
          </View>

          <View style={styles.timeInfo}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.hoursText}>{item.hoursSpent}h logged</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Tasks & Performance',
          headerRight: () => (
            <Pressable onPress={() => router.push('/manage/pms/add')} style={styles.headerAddBtn}>
              <Plus size={24} color="#4F46E5" />
            </Pressable>
          )
        }} 
      />

      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
            <StatCard label="Total Tasks" value={stats.total} icon={<ListIcon size={18} color="#4F46E5" />} bg="#EEF2FF" />
            <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 size={18} color="#10B981" />} bg="#ECFDF5" />
            <StatCard label="Pending" value={stats.pending} icon={<AlertCircle size={18} color="#F59E0B" />} bg="#FFFBEB" />
            <StatCard label="Hours" value={`${stats.hours}h`} icon={<Clock size={18} color="#6366F1" />} bg="#F5F3FF" />
          </ScrollView>
        </View>

        {/* Search & Filters */}
        <View style={styles.filterSection}>
          <View style={styles.searchBox}>
            <Search size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks, project, employee..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#9CA3AF"
            />
            {searchTerm.length > 0 && (
              <Pressable onPress={() => setSearchTerm('')}>
                <X size={18} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
            <Pressable 
              style={[styles.filterChip, statusFilter === 'all' && styles.activeChip]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={[styles.chipText, statusFilter === 'all' && styles.activeChipText]}>All Tasks</Text>
            </Pressable>
            {['In-Progress', 'Completed', 'Review'].map(status => (
              <Pressable 
                key={status}
                style={[styles.filterChip, statusFilter === status.toLowerCase() && styles.activeChip]}
                onPress={() => setStatusFilter(status.toLowerCase())}
              >
                <Text style={[styles.chipText, statusFilter === status.toLowerCase() && styles.activeChipText]}>{status}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Task List */}
        <View style={styles.listContainer}>
          {filteredTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              {renderTaskItem({ item: task, index })}
            </React.Fragment>
          ))}
          {filteredTasks.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found matches your criteria.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable 
        style={styles.fab}
        onPress={() => router.push('/manage/pms/add')}
      >
        <Plus size={28} color="#FFF" />
      </Pressable>
    </View>
  );
}

function StatCard({ label, value, icon, bg }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]} lightColor={bg} darkColor={bg}>
      <View style={styles.statIcon} lightColor="rgba(255, 255, 255, 0.5)" darkColor="rgba(255, 255, 255, 0.2)">
        {icon}
      </View>
      <View style={{ backgroundColor: 'transparent' }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerAddBtn: {
    padding: 8,
  },
  statsContainer: {
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  statsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  filterSection: {
    backgroundColor: '#FFF',
    paddingBottom: 12,
    borderBottomWidth:1,
    borderBottomColor: '#F3F4F6',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  filterBar: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeChip: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  chipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  projectText: {
    fontSize: 13,
    color: '#6B7280',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  assigneeName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hoursText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
