import React, { useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Plus, User, Globe, Server } from 'lucide-react-native';
import { Text } from '@/components/Themed';

export default function QuickNavFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Plus size={28} color="#FFF" />
      </Pressable>
      {open && (
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.title}>Quick Navigation</Text>
            <View style={styles.list}>
              <Pressable style={styles.item} onPress={() => { setOpen(false); router.push('/manage/clients'); }}>
                <View style={styles.iconBox}>
                  <User size={18} color="#4F46E5" />
                </View>
                <Text style={styles.itemText}>Clients</Text>
              </Pressable>
              <Pressable style={styles.item} onPress={() => { setOpen(false); router.push('/manage/domains'); }}>
                <View style={styles.iconBox}>
                  <Globe size={18} color="#4F46E5" />
                </View>
                <Text style={styles.itemText}>Domains</Text>
              </Pressable>
              <Pressable style={styles.item} onPress={() => { setOpen(false); router.push('/manage/hosting'); }}>
                <View style={styles.iconBox}>
                  <Server size={18} color="#4F46E5" />
                </View>
                <Text style={styles.itemText}>Hosting</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    zIndex: 9,
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});

