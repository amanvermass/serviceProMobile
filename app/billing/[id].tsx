import React from 'react';
import { StyleSheet, ScrollView, Pressable, Linking, View } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  ChevronLeft, 
  ExternalLink, 
  Mail, 
  Phone, 
  Download, 
  Globe, 
  Server, 
  Settings, 
  History 
} from 'lucide-react-native';
import { Text } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';

const MOCK_DATA = {
  '1': {
    id: '1',
    company: 'TechCorp Solutions',
    client: 'John Doe',
    email: 'john@techcorp.com',
    phone: '+91 98765 43210',
    domain: { status: 'Paid', date: 'May 15, 2024', provider: 'GoDaddy', cost: '₹1,500' },
    hosting: { status: 'Unpaid', date: 'Jun 20, 2024', provider: 'AWS Cloud', cost: '₹12,000' },
    maintenance: { status: 'Not Raised', date: 'May 1, 2024', plan: 'Premium Support', cost: '₹5,000' },
    history: [
      { date: 'Apr 02, 2026', event: 'Payment Received', amount: '₹500', status: 'Partial' },
      { date: 'Mar 15, 2026', event: 'Invoice Generated', amount: '₹12,000', status: 'Pending' },
    ]
  },
  '2': {
    id: '2',
    company: 'Digital Innovations Inc',
    client: 'Sarah Smith',
    email: 'sarah@digital.com',
    phone: '+91 87654 32109',
    domain: { status: 'Paid', date: 'Apr 10, 2024', provider: 'Namecheap', cost: '₹1,200' },
    hosting: { status: 'Paid', date: 'Apr 30, 2024', provider: 'Vercel', cost: '₹0' },
    maintenance: { status: 'Paid', date: 'Mar 20, 2024', plan: 'Standard', cost: '₹3,000' },
    history: [
      { date: 'Mar 20, 2026', event: 'Full Payment Received', amount: '₹4,200', status: 'Completed' },
    ]
  }
};

export default function BillingDetailScreen() {
  const { id } = useLocalSearchParams();
  const project = MOCK_DATA[id as keyof typeof MOCK_DATA] || MOCK_DATA['1'];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: `Project #${project.id}`,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#111827" />
            </Pressable>
          ),
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerCard}>
          <Text style={styles.companyName}>{project.company}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge type="Paid" label="Active Project" />
            <Text style={styles.idLabel}>ID: {project.id}</Text>
          </View>
        </View>

        {/* Client Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.clientCard}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{project.client}</Text>
              <View style={styles.contactRow}>
                <Mail size={14} color="#6B7280" />
                <Text style={styles.contactText}>{project.email}</Text>
              </View>
              <View style={styles.contactRow}>
                <Phone size={14} color="#6B7280" />
                <Text style={styles.contactText}>{project.phone}</Text>
              </View>
            </View>
            <View style={styles.actionGrid}>
              <Pressable style={styles.iconAction}>
                <Mail size={18} color="#4F46E5" />
              </Pressable>
              <Pressable style={styles.iconAction}>
                <Phone size={18} color="#10B981" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          
          <ServiceRow 
            icon={Globe} 
            title="Domain Registration" 
            data={project.domain} 
            color="#3B82F6" 
            subLabel="Provider"
            subValue={project.domain.provider}
          />
          
          <ServiceRow 
            icon={Server} 
            title="Hosting Plan" 
            data={project.hosting} 
            color="#8B5CF6" 
            subLabel="Infrastructure"
            subValue={project.hosting.provider}
          />
          
          <ServiceRow 
            icon={Settings} 
            title="Maintenance & Support" 
            data={project.maintenance} 
            color="#F59E0B" 
            subLabel="Plan Type"
            subValue={(project.maintenance as any).plan}
          />
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <History size={16} color="#9CA3AF" />
          </View>
          {project.history.map((item, index) => (
            <View key={index} style={styles.historyRow}>
              <View style={styles.historyDot} />
              <View style={styles.historyContent}>
                <View style={styles.historyTextRow}>
                  <Text style={styles.historyEvent}>{item.event}</Text>
                  <Text style={styles.historyAmount}>{item.amount}</Text>
                </View>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions Section */}
        <View style={styles.footerActions}>
          <Pressable style={styles.primaryAction}>
            <Download size={18} color="#FFF" />
            <Text style={styles.primaryActionText}>Export Statement</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Edit Project</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function ServiceRow({ icon: Icon, title, data, color, subLabel, subValue }: any) {
  return (
    <View style={styles.serviceRow}>
      <View style={[styles.serviceIcon, { backgroundColor: color + '10' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.serviceBody}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceTitle}>{title}</Text>
          <StatusBadge type={data.status} />
        </View>
        <View style={styles.serviceInfoGrid}>
          <View>
            <Text style={styles.infoLabel}>{subLabel}</Text>
            <Text style={styles.infoValue}>{subValue}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View>
            <Text style={styles.infoLabel}>RENEWAL</Text>
            <Text style={styles.infoValue}>{data.date}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View>
            <Text style={styles.infoLabel}>COST</Text>
            <Text style={styles.infoValue}>{data.cost}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  backButton: {
    padding: 10,
    marginLeft: -10,
  },
  headerCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  idLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  contactText: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  iconAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceRow: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 16,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceBody: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  serviceInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  infoDivider: {
    width: 1,
    height: 15,
    backgroundColor: '#E5E7EB',
  },
  historyRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  historyTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyEvent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  primaryAction: {
    flex: 2,
    backgroundColor: '#111827',
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
