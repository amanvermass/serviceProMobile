import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { Boxes, ClipboardList, Cloud, CreditCard, Users } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

export default function CentralMenuScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Quick Modules</Text>
          <Text style={styles.heroSubtitle}>
            Access core tools like Billing, Assets, PMS, Backup, and CRM from one place.
          </Text>
        </View>

        <View style={styles.grid}>
          <MenuCard
            icon={<Boxes size={24} color="#4F46E5" />}
            label="Assets"
            onPress={() => { }}
          />
          <MenuCard
            icon={<CreditCard size={24} color="#4F46E5" />}
            label="Billing"
            onPress={() => router.push('/billing')}
          />
          <MenuCard
            icon={<ClipboardList size={24} color="#4F46E5" />}
            label="PMS"
            onPress={() => { }}
          />
          <MenuCard
            icon={<Cloud size={24} color="#4F46E5" />}
            label="Backup"
            onPress={() => { }}
          />
          <MenuCard
            icon={<Users size={24} color="#4F46E5" />}
            label="CRM"
            onPress={() => { }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function MenuCard({ icon, label, onPress }: any) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardIcon}>{icon}</View>
      <Text style={styles.cardLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  hero: {
    backgroundColor: '#FFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
