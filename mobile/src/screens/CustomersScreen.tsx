import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { endpoints } from '../config/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${endpoints.customers}?limit=all&search=${encodeURIComponent(search)}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomers(data.customers);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat data pelanggan");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Premium */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Data Pelanggan</Text>
          <Text style={styles.headerSubtitle}>Kelola daftar kontak pelanggan Anda</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="people" size={24} color="#10B981" />
        </View>
      </View>

      <View style={styles.content}>
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari berdasarkan nama atau WhatsApp..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={{ padding: 10 }}>
              <Ionicons name="close-circle" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Memuat pelanggan...</Text>
          </View>
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>Belum ada data pelanggan yang sesuai.</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.customerCard}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{item.name}</Text>
                  <Text style={styles.customerPhone}>{item.phone}</Text>
                </View>
                <View style={styles.customerDateBox}>
                  <Text style={styles.customerDateLabel}>BERGABUNG PADA</Text>
                  <Text style={styles.customerDate}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 25, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  headerIcon: { width: 44, height: 44, backgroundColor: '#ECFDF5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  content: { flex: 1, padding: 15 },
  
  errorBox: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FECACA', marginBottom: 15, alignItems: 'center' },
  errorText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, height: 55, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 2 },
  searchIcon: { paddingHorizontal: 15 },
  searchInput: { flex: 1, height: '100%', fontSize: 14, color: '#0F172A', fontWeight: '500' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { color: '#94A3B8', fontWeight: '600', fontSize: 13, marginTop: 15, fontStyle: 'italic' },

  customerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  customerAvatar: { width: 46, height: 46, backgroundColor: '#ECFDF5', borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  customerAvatarText: { fontSize: 18, fontWeight: '900', color: '#10B981' },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  customerPhone: { fontSize: 13, color: '#64748B', fontFamily: 'monospace', fontWeight: '600' },
  
  customerDateBox: { alignItems: 'flex-end' },
  customerDateLabel: { fontSize: 9, fontWeight: 'bold', color: '#94A3B8', marginBottom: 4 },
  customerDate: { fontSize: 11, fontWeight: 'bold', color: '#1E293B' },
});
