import React from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  CreditCard, 
  AlertCircle, 
  Send, 
  FileText,
  Globe,
  Server,
  HardDrive,
  Mail
} from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import StatusBadge from '@/components/StatusBadge';

const RENEWALS_DATA = [
  { id: '1', company: 'TechCorp Solutions', client: 'John Doe', status: 'Paid', date: 'May 15, 2024', payment: 'Full Payment', type: 'Domain', amount: '₹1,500', provider: 'GoDaddy' },
  { id: '2', company: 'GreenStart Ventures', client: 'Michael Brown', status: 'Unpaid', date: 'Jun 10, 2024', payment: 'Partial Payment', type: 'Domain', amount: '₹1,200', provider: 'Namecheap' },
  { id: '3', company: 'Digital Innovations Inc', client: 'Sarah Smith', status: 'Paid', date: 'Apr 30, 2024', payment: 'Full Payment', type: 'Hosting', amount: '₹12,000', provider: 'AWS Cloud' },
  { id: '4', company: 'Wellness Hub', client: 'Emily Davis', status: 'Unpaid', date: 'May 5, 2024', payment: 'Partial Payment', type: 'Hosting', amount: '₹5,000', provider: 'DigitalOcean' },
];

const ICONS = {
  Domain: Globe,
  Hosting: Server,
  Maintenance: HardDrive,
  Email: Mail,
};

export default function RenewalDetailScreen() {
  const { id } = useLocalSearchParams();
  const item = RENEWALS_DATA.find(d => d.id === id) || RENEWALS_DATA[0];
  const Icon = ICONS[item.type as keyof typeof ICONS] || Globe;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Renewal Details',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#111827" />
            </Pressable>
          ),
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Alert Card */}
        <View style={[styles.alertCard, item.status === 'Unpaid' && styles.unpaidAlert]}>
          <View style={styles.alertHeader}>
            <View style={styles.iconBox}>
              <Icon size={24} color="#4F46E5" />
            </View>
            <View style={styles.alertMeta}>
              <Text style={styles.companyName}>{item.company}</Text>
              <Text style={styles.serviceType}>{item.type} Service</Text>
            </View>
          </View>
          
          <View style={styles.alertStatusRow}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>RENEWAL STATUS</Text>
              <StatusBadge type={item.status as any} />
            </View>
            <View style={styles.divider} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>DUE DATE</Text>
              <Text style={styles.dueDate}>{item.date}</Text>
            </View>
          </View>
        </View>

        {/* Financial Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.financialCard}>
            <FinancialRow label="Base Amount" value={item.amount} />
            <FinancialRow label="Tax (GST 18%)" value="₹270" />
            <View style={styles.hr} />
            <FinancialRow label="Total Payable" value="₹1,770" isTotal />
            
            <View style={styles.paymentMethod}>
              <CreditCard size={16} color="#6B7280" />
              <Text style={styles.paymentMethodText}>Payment Type: <Text style={styles.bold}>{item.payment}</Text></Text>
            </View>
          </View>
        </View>

        {/* Service Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Specifications</Text>
          <View style={styles.specsCard}>
            <SpecRow label="Provider" value={item.provider} />
            <SpecRow label="Registration Link" value={`https://${item.company.toLowerCase().replace(' ', '')}.com`} isLink />
            <SpecRow label="Client Name" value={item.client} />
            <SpecRow label="Auto-Renew" value="Disabled" />
          </View>
        </View>

        {/* Help Note */}
        <View style={styles.infoBox}>
          <AlertCircle size={18} color="#4F46E5" />
          <Text style={styles.infoBoxText}>
            Renewals must be processed at least 48 hours before the due date to avoid service interruption.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionGrid}>
          <ActionButton 
            icon={Send} 
            label="Send Reminder" 
            onPress={() => {}} 
          />
        </View>
      </ScrollView>
    </View>
  );
}

function FinancialRow({ label, value, isTotal }: any) {
  return (
    <View style={styles.financialRow}>
      <Text style={[styles.financialLabel, isTotal && styles.totalLabel]}>{label}</Text>
      <Text style={[styles.financialValue, isTotal && styles.totalValue]}>{value}</Text>
    </View>
  );
}

function SpecRow({ label, value, isLink }: any) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={[styles.specValue, isLink && styles.linkText]}>{value}</Text>
    </View>
  );
}

function ActionButton({ icon: Icon, label, primary, onPress }: any) {
  return (
    <Pressable 
      style={[styles.actionButton, primary ? styles.primaryButton : styles.secondaryButton]}
      onPress={onPress}
    >
      <Icon size={18} color={primary ? '#FFF' : '#374151'} />
      <Text style={[styles.actionButtonText, primary ? styles.primaryButtonText : styles.secondaryButtonText]}>
        {label}
      </Text>
    </Pressable>
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
  alertCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  unpaidAlert: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertMeta: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  serviceType: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  alertStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9CA3AF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  dueDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
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
  financialCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  financialLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  hr: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  specsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  specLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  linkText: {
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 24,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#4F46E5',
    lineHeight: 18,
    fontWeight: '500',
  },
  actionGrid: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#111827',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#FFF',
  },
  secondaryButtonText: {
    color: '#374151',
  },
});
