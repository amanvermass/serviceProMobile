import ClientShimmer from '@/components/ClientShimmer';
import StatusBadge from '@/components/StatusBadge';
import { Text, View } from '@/components/Themed';
import { domainApi, hostingApi, maintenanceApi, vendorApi } from '@/lib/api';
import { router } from 'expo-router';
import { Briefcase, Calendar, CreditCard, Edit3, Globe, HardDrive, Mail, MoreVertical, Plus, Server, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';

type RenewalCategory = 'Domain' | 'Hosting' | 'Maintenance' | 'Email';

const RENEWALS_DATA: Record<RenewalCategory, any[]> = {
  Domain: [
    { id: '1', company: 'TechCorp Solutions', client: 'John Doe', status: 'Paid', date: 'May 15, 2024', payment: 'Full Payment' },
    { id: '2', company: 'GreenStart Ventures', client: 'Michael Brown', status: 'Unpaid', date: 'Jun 10, 2024', payment: 'Partial Payment' },
  ],
  Hosting: [
    { id: '3', company: 'Digital Innovations Inc', client: 'Sarah Smith', status: 'Paid', date: 'Apr 30, 2024', payment: 'Full Payment' },
    { id: '4', company: 'Wellness Hub', client: 'Emily Davis', status: 'Unpaid', date: 'May 5, 2024', payment: 'Partial Payment' },
  ],
  Maintenance: [
    { id: '5', company: 'Eco Friendly Co', client: 'Alice Johnson', status: 'Not Raised', date: 'Jun 20, 2024', payment: 'Not Raised' },
  ],
  Email: [
    { id: '6', company: 'Cloud Nine', client: 'Bob Wilson', status: 'Paid', date: 'Jul 01, 2024', payment: 'Full Payment' },
  ],
};

const CATEGORIES: { label: RenewalCategory; icon: any }[] = [
  { label: 'Domain', icon: Globe },
  { label: 'Hosting', icon: Server },
  { label: 'Maintenance', icon: HardDrive },
  { label: 'Email', icon: Mail },
];

export default function RenewalsScreen() {
  const [activeTab, setActiveTab] = useState<RenewalCategory>('Domain');
  const [domainItems, setDomainItems] = useState<any[]>([]);
  const [hostingItems, setHostingItems] = useState<any[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [navAddLoading, setNavAddLoading] = useState(false);
  const [fabLoading, setFabLoading] = useState(false);
  const [menuSheet, setMenuSheet] = useState<{ type: 'domain' | 'hosting' | 'maintenance' | 'list'; item: any } | null>(null);

  const navigateToDetail = (item: any) => {
    router.push({
      pathname: '/renewals/[id]',
      params: { id: item.id, payload: JSON.stringify(item) }
    });
  };

  const mapDomains = (arr: any[]) => {
    return (Array.isArray(arr) ? arr : []).map((d: any) => {
      const id = d._id || d.id || String(Math.random());
      const clientName = d.client?.company || d.client?.name || 'N/A';
      let daysRemaining = 999;
      if (d.expiryDate) {
        const exp = new Date(d.expiryDate);
        const now = new Date();
        daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      let status = 'Active';
      if (daysRemaining < 0) status = 'Expired';
      else if (daysRemaining <= 30) status = 'Expiring Soon';
      const date = d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'N/A';
      return {
        id,
        company: d.domainName || d.name || d.domain || 'N/A',
        client: clientName,
        status,
        date,
        payment: 'N/A',
      };
    });
  };

  const mapHostings = (arr: any[]) => {
    return (Array.isArray(arr) ? arr : []).map((h: any) => {
      const id = h._id || h.id || String(Math.random());
      const clientName = h.client?.company || h.client?.name || h.clientName || 'N/A';
      const domainName = h.domain?.name || h.domain?.domainName || h.domainName || h.domain || 'Hosting';
      let daysRemaining = 999;
      if (h.renewalDate) {
        const exp = new Date(h.renewalDate);
        const now = new Date();
        daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      let status = 'Active';
      if (daysRemaining < 0) status = 'Expired';
      else if (daysRemaining <= 30) status = 'Expiring Soon';
      const date = h.renewalDate ? new Date(h.renewalDate).toLocaleDateString() : 'N/A';
      return {
        id,
        company: domainName,
        client: clientName,
        status,
        date,
        payment: 'N/A',
      };
    });
  };

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await domainApi.getDomains({ page: 1 });
      const arr = response.data || response || [];
      setDomainItems(arr);
    } catch (e) {
      setDomainItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostings = async () => {
    try {
      setLoading(true);
      const response = await hostingApi.getHostings({ page: 1 });
      const arr = response.data || response || [];
      setHostingItems(arr);
    } catch (e) {
      setHostingItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const response = await maintenanceApi.getMaintenances({ page: 1 });
      const arr = response.data || response || [];
      setMaintenanceItems(arr);
    } catch (e) {
      setMaintenanceItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Domain') {
      fetchDomains();
    } else if (activeTab === 'Hosting') {
      fetchHostings();
    } else if (activeTab === 'Maintenance') {
      fetchMaintenances();
    }
  }, [activeTab]);

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const res = await vendorApi.getProviders();
        setVendors(Array.isArray(res) ? res : (res.data || []));
      } catch { }
    };
    loadVendors();
  }, []);

  const handleDeleteDomain = (id: string, name: string) => {
    Alert.alert(
      'Delete Domain',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await domainApi.deleteDomain(id);
              fetchDomains();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete domain');
            }
          }
        }
      ]
    );
  };

  const handleDeleteHosting = (id: string, name: string) => {
    Alert.alert(
      'Delete Hosting',
      `Are you sure you want to delete hosting for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await hostingApi.deleteHosting(id);
              fetchHostings();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete hosting');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const idVal = String(item.id || item.company || Math.random());
    return (
      <Pressable style={styles.card} onPress={() => navigateToDetail(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{item.company}</Text>
            <Text style={styles.clientLabel}>CLIENT: <Text style={styles.clientName}>{item.client}</Text></Text>
          </View>
          <Pressable
            onPress={() => setMenuSheet({ type: 'list', item })}
            style={styles.moreBtn}
          >
            <MoreVertical size={20} color="#6B7280" />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>RENEWAL DATE</Text>
            <Text style={styles.detailValue}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>PAYMENT TYPE</Text>
            <StatusBadge type={item.payment} label={item.payment.split(' ')[0]} />
          </View>
        </View>
      </Pressable>
    );
  };

  const renderDomainItem = ({ item }: { item: any }) => {
    const clientName = item.client?.company || item.company || item.client?.name || 'N/A';
    const idVal = String(item._id || item.id || item.domainName || item.name || item.domain);
    let registrarName = 'N/A';
    if (item.registrar && typeof item.registrar === 'object' && item.registrar.name) {
      registrarName = item.registrar.name;
    } else {
      const vendorId = typeof item.registrar === 'string' ? item.registrar : (item.provider || '');
      if (vendorId) {
        const found = vendors.find((v: any) => v._id === vendorId || v.id === vendorId);
        if (found) registrarName = found.name;
      }
    }
    let daysRemaining = 999;
    if (item.expiryDate) {
      const expDate = new Date(item.expiryDate);
      const now = new Date();
      daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
    let expiryStatusLabel = 'Active';
    let expiryColorClass = '#10B981';
    if (daysRemaining < 0) {
      expiryStatusLabel = 'Expired';
      expiryColorClass = '#EF4444';
    } else if (daysRemaining <= 30) {
      expiryStatusLabel = 'Expiring Soon';
      expiryColorClass = '#F59E0B';
    }

    return (
      <Pressable style={styles.domainCard} onPress={() => navigateToDetail({ id: item._id || item.id, company: item.domainName || item.name || item.domain, client: clientName, status: expiryStatusLabel, date: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A', payment: 'N/A' })}>
        <View style={styles.cardHeader}>
          <View style={styles.domainInfo}>
            <Text style={styles.domainName}>{item.domainName || item.name || item.domain}</Text>
            <StatusBadge type={item.status || 'active'} />
          </View>
          <Pressable
            onPress={() => setMenuSheet({ type: 'domain', item })}
            style={styles.moreBtn}
          >
            <MoreVertical size={20} color="#6B7280" />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.contactInfo}>
          <View style={styles.infoRow}>
            <Briefcase size={14} color="#6B7280" />
            <Text style={styles.infoText}>{clientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Globe size={14} color="#6B7280" />
            <Text style={styles.infoText}>Vendor: {registrarName}</Text>
          </View>
          <View style={styles.infoRow}>
            <CreditCard size={14} color="#6B7280" />
            <Text style={styles.infoText}>Cost: ${Number(item.cost || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.dot, { backgroundColor: expiryColorClass }]} />
            <Text style={[styles.infoText, { color: expiryColorClass, fontWeight: '600' }]}>
              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'} • {expiryStatusLabel}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderHostingItem = ({ item }: { item: any }) => {
    const idVal = String(item._id || item.id || item.domainName || item.domain?.name || item.domain || '');
    const clientName = item.clientName || item.client?.company || item.company || item.client?.name || 'N/A';
    const providerName = item.providerName || item.provider?.name || item.provider || 'N/A';
    const serviceTypeName = item.serviceTypeName || item.serviceType?.name || item.serviceType || 'Unknown Type';
    const domainName = item.domainName || item.domain?.domainName || item.domain?.name || item.domain || 'No Domain Linked';

    let daysRemaining = 999;
    if (item.renewalDate) {
      const expDate = new Date(item.renewalDate);
      const now = new Date();
      daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    let expiryStatusLabel = 'Active';
    let expiryColorClass = '#10B981';
    if (daysRemaining < 0) {
      expiryStatusLabel = 'Expired';
      expiryColorClass = '#EF4444';
    } else if (daysRemaining <= 30) {
      expiryStatusLabel = 'Expiring Soon';
      expiryColorClass = '#F59E0B';
    }

    return (
      <Pressable style={styles.hostingCard} onPress={() => navigateToDetail({ id: item._id || item.id, company: domainName, client: clientName, status: expiryStatusLabel, date: item.renewalDate ? new Date(item.renewalDate).toLocaleDateString() : 'N/A', payment: 'N/A' })}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconBox}>
              <Server size={20} color="#4F46E5" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.domainName} numberOfLines={1}>{domainName}</Text>
              <Text style={styles.serviceType}>{serviceTypeName}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setMenuSheet({ type: 'hosting', item })}
            style={styles.moreBtn}
          >
            <MoreVertical size={20} color="#6B7280" />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.contactInfo}>
          <View style={styles.infoRow}>
            <Briefcase size={14} color="#6B7280" />
            <Text style={styles.infoText}>{clientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Server size={14} color="#6B7280" />
            <Text style={styles.infoText}>Provider: {providerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <CreditCard size={14} color="#6B7280" />
            <Text style={styles.infoText}>Monthly Cost: ${Number(item.monthlyCost || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.dot, { backgroundColor: expiryColorClass }]} />
            <Text style={[styles.infoText, { color: expiryColorClass, fontWeight: '600' }]}>
              {item.renewalDate ? new Date(item.renewalDate).toLocaleDateString() : 'N/A'} • {expiryStatusLabel}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderMaintenanceItem = ({ item }: { item: any }) => {
    const projectName = item.projectName || item.name || 'Maintenance Project';
    const clientName = item.client?.name || item.client || item.clientName || 'Unknown Client';
    const start = item.amcStartDate || item.startDate || '';
    const end = item.amcEndDate || item.endDate || '';
    const monthlyValue = Number(item.monthlyValue || 0);

    let daysRemaining = 9999;
    if (end) {
      const endDate = new Date(end);
      const now = new Date();
      daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
    let expiryStatusLabel = 'Active';
    let expiryColorClass = '#10B981';
    if (daysRemaining < 0) {
      expiryStatusLabel = 'Expired';
      expiryColorClass = '#EF4444';
    } else if (daysRemaining <= 30) {
      expiryStatusLabel = 'Expiring Soon';
      expiryColorClass = '#F59E0B';
    }

    return (
      <Pressable style={styles.hostingCard} onPress={() => navigateToDetail({ id: item._id || item.id, company: projectName, client: clientName, status: expiryStatusLabel, date: (end ? new Date(end).toLocaleDateString() : 'N/A'), payment: 'N/A' })}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconBox}>
              <HardDrive size={20} color="#4F46E5" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.domainName} numberOfLines={1}>{projectName}</Text>
              <Text style={styles.serviceType}>Maintenance</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setMenuSheet({ type: 'maintenance', item })}
            style={styles.moreBtn}
          >
            <MoreVertical size={20} color="#6B7280" />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.contactInfo}>
          <View style={styles.infoRow}>
            <Briefcase size={14} color="#6B7280" />
            <Text style={styles.infoText}>{clientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              {(start ? new Date(start).toLocaleDateString() : 'N/A')} - {(end ? new Date(end).toLocaleDateString() : 'N/A')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <CreditCard size={14} color="#6B7280" />
            <Text style={styles.infoText}>Monthly Value: ${monthlyValue.toFixed(2)}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.dot, { backgroundColor: expiryColorClass }]} />
            <Text style={[styles.infoText, { color: expiryColorClass, fontWeight: '600' }]}>
              {(end ? new Date(end).toLocaleDateString() : 'N/A')} • {expiryStatusLabel}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.label}
                onPress={() => setActiveTab(cat.label)}
                style={[styles.tab, activeTab === cat.label && styles.activeTab]}>
                <cat.icon size={16} color={activeTab === cat.label ? '#111827' : '#6B7280'} />
                <Text style={[styles.tabText, activeTab === cat.label && styles.activeTabText]}>
                  {cat.label} ({RENEWALS_DATA[cat.label]?.length || 0})
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <View style={styles.list}>
          <ClientShimmer />
          <ClientShimmer />
          <ClientShimmer />
        </View>
      ) : (
        <FlatList
          data={
            activeTab === 'Domain'
              ? domainItems
              : activeTab === 'Hosting'
                ? hostingItems
                : activeTab === 'Maintenance'
                  ? maintenanceItems
                  : RENEWALS_DATA[activeTab]
          }
          keyExtractor={(item: any) => item._id || item.id || String(Math.random())}
          renderItem={
            activeTab === 'Domain'
              ? renderDomainItem
              : activeTab === 'Hosting'
                ? renderHostingItem
                : activeTab === 'Maintenance'
                  ? renderMaintenanceItem
                  : renderItem
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} renewals found.</Text>
            </View>
          }
        />
      )}
      {menuSheet && (
        <Pressable style={styles.overlay} onPress={() => setMenuSheet(null)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.menuTitle}>Quick Actions</Text>
            {menuSheet.type === 'domain' && (
              <>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuSheet(null);
                    const it = menuSheet.item;
                    router.push({ pathname: '/manage/domains/add', params: { id: it._id || it.id, payload: JSON.stringify(it) } });
                  }}
                >
                  <Edit3 size={16} color="#4F46E5" />
                  <Text style={styles.menuText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuSheet(null);
                    const it = menuSheet.item;
                    router.push({ pathname: '/manage/domains/renew', params: { id: it._id || it.id, name: it.domainName || it.name || it.domain, expiryDate: it.expiryDate } });
                  }}
                >
                  <Globe size={16} color="#059669" />
                  <Text style={[styles.menuText, { color: '#059669' }]}>Renew</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    const it = menuSheet.item;
                    setMenuSheet(null);
                    handleDeleteDomain(it._id || it.id, it.domainName || it.name || it.domain);
                  }}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={[styles.menuText, { color: '#EF4444' }]}>Delete</Text>
                </Pressable>
              </>
            )}
            {menuSheet.type === 'hosting' && (
              <>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuSheet(null);
                    const it = menuSheet.item;
                    router.push({ pathname: '/manage/hosting/add', params: { id: it._id || it.id, payload: JSON.stringify(it) } });
                  }}
                >
                  <Edit3 size={16} color="#4F46E5" />
                  <Text style={styles.menuText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuSheet(null);
                    const it = menuSheet.item;
                    const domainName = it.domainName || it.domain?.domainName || it.domain?.name || it.domain || 'Hosting';
                    router.push({ pathname: '/manage/hosting/renew', params: { id: it._id || it.id, name: domainName, renewalDate: it.renewalDate } });
                  }}
                >
                  <Server size={16} color="#059669" />
                  <Text style={[styles.menuText, { color: '#059669' }]}>Renew</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    const it = menuSheet.item;
                    const domainName = it.domainName || it.domain?.domainName || it.domain?.name || it.domain || 'Hosting';
                    setMenuSheet(null);
                    handleDeleteHosting(it._id || it.id, domainName);
                  }}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={[styles.menuText, { color: '#EF4444' }]}>Delete</Text>
                </Pressable>
              </>
            )}
            {menuSheet.type === 'list' && (
              <>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuSheet(null);
                    navigateToDetail(menuSheet.item);
                  }}
                >
                  <Edit3 size={16} color="#4F46E5" />
                  <Text style={styles.menuText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuSheet(null);
                    navigateToDetail(menuSheet.item);
                  }}
                >
                  <Globe size={16} color="#059669" />
                  <Text style={[styles.menuText, { color: '#059669' }]}>Renew</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuSheet(null);
                    Alert.alert('Delete', 'Delete action is not configured for this item.');
                  }}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={[styles.menuText, { color: '#EF4444' }]}>Delete</Text>
                </Pressable>
              </>
            )}
            {menuSheet.type === 'maintenance' && (
              <>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    const it = menuSheet.item;
                    setMenuSheet(null);
                    router.push({ pathname: '/manage/maintenance/add', params: { id: it._id || it.id, payload: JSON.stringify(it) } });
                  }}
                >
                  <Edit3 size={16} color="#4F46E5" />
                  <Text style={styles.menuText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    const it = menuSheet.item;
                    setMenuSheet(null);
                    Alert.alert('Delete', 'Delete action is not wired for Maintenance list yet.');
                  }}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={[styles.menuText, { color: '#EF4444' }]}>Delete</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      )}
      {(activeTab === 'Domain' || activeTab === 'Hosting' || activeTab === 'Maintenance') && (
        <Pressable
          style={styles.fab}
          onPress={() => {
            if (activeTab === 'Domain') {
              router.push('/manage/domains/add');
            } else if (activeTab === 'Hosting') {
              router.push('/manage/hosting/add');
            } else {
              router.push('/manage/maintenance/add');
            }
          }}
        >
          <Plus size={28} color="#FFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    paddingBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  addButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 13,
  },
  tabsContainer: {
    paddingBottom: 10,
  },
  tabsScroll: {
    paddingHorizontal: 15,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
  },
  list: {
    padding: 16,
  },
  domainCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  hostingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  clientLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  clientName: {
    color: '#4B5563',
    fontWeight: '700',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  domainInfo: {
    flex: 1,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  domainName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  serviceType: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  contactInfo: {
    gap: 8,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  moreBtn: {
    padding: 6,
    marginRight: -6,
  },
  cardMenu: {
    position: 'absolute',
    top: 32,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    minWidth: 160,
    zIndex: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    zIndex: 30,
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },
  renewButton: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  renewText: {
    color: '#059669',
  },
  deleteButton: {
    borderColor: '#FCA5A5',
  },
  deleteText: {
    color: '#EF4444',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
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
    zIndex: 12,
  },
});
