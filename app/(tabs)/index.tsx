import React from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { DollarSign, Briefcase, Clock, CheckCircle } from 'lucide-react-native';
import { Text, View } from '@/components/Themed';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>Admin User</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="Total Revenue" value="₹45,231" icon={DollarSign} color="#10B981" />
        <StatCard title="Active Projects" value="24" icon={Briefcase} color="#3B82F6" />
        <StatCard title="Pending Invoices" value="7" icon={Clock} color="#F59E0B" />
        <StatCard title="Completed Renewals" value="18" icon={CheckCircle} color="#8B5CF6" />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>
        
        <RenewalItem company="TechCorp Solutions" service="Domain" days={3} status="Urgent" />
        <RenewalItem company="Wellness Hub" service="Hosting" days={5} status="Normal" />
        <RenewalItem company="Digital Innovations" service="Maintenance" days={12} status="Normal" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.statusCard}>
          <StatusRow label="Backups" value="HEALTHY" />
          <StatusRow label="Notifications" value="ACTIVE" />
          <StatusRow label="Billing Engine" value="ONLINE" last />
        </View>
      </View>
    </ScrollView>
  );
}

function StatusRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.statusRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '10' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function RenewalItem({ company, service, days, status }: { company: string; service: string; days: number; status: string }) {
  const color = status === 'Urgent' ? '#EF4444' : '#6B7280';
  return (
    <View style={styles.renewalItem}>
      <View>
        <Text style={styles.renewalCompany}>{company}</Text>
        <Text style={styles.renewalService}>{service} renewal</Text>
      </View>
      <View style={styles.renewalTime}>
        <Text style={[styles.renewalDays, { color }]}>in {days} days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: '46%', // Approximate for 2 columns
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexGrow: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    padding: 24,
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAll: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  renewalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  renewalCompany: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  renewalService: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  renewalTime: {
    alignItems: 'flex-end',
  },
  renewalDays: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  statusValue: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
