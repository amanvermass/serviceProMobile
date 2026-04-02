import React from 'react';
import { StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { User, Bell, Shield, CircleHelp, LogOut, ChevronRight } from 'lucide-react-native';
import { Text, View } from '@/components/Themed';

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AU</Text>
        </View>
        <Text style={styles.name}>Admin User</Text>
        <Text style={styles.email}>admin@servicepro.com</Text>
        <Pressable style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <SettingItem icon={Bell} title="Notifications" right={<Switch value={notifications} onValueChange={setNotifications} />} />
        <SettingItem icon={User} title="Account Details" />
        <SettingItem icon={Shield} title="Security & Privacy" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem icon={CircleHelp} title="Help Center" />
        <SettingItem icon={Shield} title="Terms of Service" />
        <SettingItem icon={LogOut} title="Sign Out" color="#EF4444" showChevron={false} />
      </View>

      <Text style={styles.version}>Version 1.0.0 (Build 1234)</Text>
    </ScrollView>
  );
}

function SettingItem({ icon: Icon, title, right, color = '#111827', showChevron = true }: any) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={[styles.settingTitle, { color }]}>{title}</Text>
      </View>
      {right ? right : showChevron && <ChevronRight size={18} color="#9CA3AF" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: '#F9FAFB',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    padding: 32,
  },
});
