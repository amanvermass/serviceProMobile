import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import StatusBadge from './StatusBadge';

export interface BillingItem {
  id: string;
  company: string;
  client: string;
  domain: { status: 'Paid' | 'Unpaid' | 'Not Raised'; date: string; payment: 'Full Payment' | 'Partial Payment' | 'Not Raised' };
  hosting: { status: 'Paid' | 'Unpaid' | 'Not Raised'; date: string; payment: 'Full Payment' | 'Partial Payment' | 'Not Raised' };
  maintenance: { status: 'Paid' | 'Unpaid' | 'Not Raised'; date: string; payment: 'Full Payment' | 'Partial Payment' | 'Not Raised' };
}

interface BillingCardProps {
  item: BillingItem;
}

export default function BillingCard({ item }: BillingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.id}>#{item.id}</Text>
          <Text style={styles.company}>{item.company}</Text>
        </View>
        <Pressable style={styles.viewButton}>
          <Text style={styles.viewText}>View</Text>
          <ChevronRight size={14} color="#6B7280" />
        </Pressable>
      </View>

      <Text style={styles.clientLabel}>CLIENT: <Text style={styles.clientValue}>{item.client}</Text></Text>

      <View style={styles.separator} />

      <View style={styles.detailsRow}>
        <DetailSection title="DOMAIN" data={item.domain} />
        <DetailSection title="HOSTING" data={item.hosting} />
        <DetailSection title="MAINTENANCE" data={item.maintenance} />
      </View>
    </View>
  );
}

function DetailSection({ title, data }: { title: string; data: BillingItem['domain'] }) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailTitle}>{title}</Text>
      <StatusBadge type={data.status} />
      <Text style={styles.renewalLabel}>RENEWAL</Text>
      <Text style={styles.date}>{data.date}</Text>
      {data.payment !== 'Not Raised' && (
        <StatusBadge type={data.payment} label={data.payment.replace(' Payment', '').toUpperCase()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  id: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  company: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewText: {
    fontSize: 12,
    color: '#374151',
    marginRight: 2,
    fontWeight: '500',
  },
  clientLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  clientValue: {
    color: '#111827',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailSection: {
    flex: 1,
    gap: 4,
  },
  detailTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  renewalLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  date: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
});
