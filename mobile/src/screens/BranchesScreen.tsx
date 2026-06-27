import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { endpoints } from '../config/api';

interface Branch {
  id: string;
  name: string;
  address: string;
  manager: string;
  status: "ACTIVE" | "INACTIVE";
}

export default function BranchesScreen() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", address: "", manager: "" });
  const [addLoading, setAddLoading] = useState(false);

  const fetchBranches = async () => {
    try {
      const res = await fetch(endpoints.branches, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setBranches(data.branches);
      } else {
        Alert.alert("Error", data.message || "Gagal memuat cabang");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreateBranch = async () => {
    if (!newBranch.name || !newBranch.address) {
      Alert.alert("Error", "Nama dan alamat wajib diisi");
      return;
    }
    setAddLoading(true);

    try {
      const res = await fetch(endpoints.branches, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(newBranch),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setBranches([data.branch, ...branches]);
        setShowAddModal(false);
        setNewBranch({ name: "", address: "", manager: "" });
        Alert.alert("Sukses", "Cabang berhasil ditambahkan");
      } else {
        Alert.alert("Error", data.message || "Gagal menambah cabang");
      }
    } catch (err) {
      Alert.alert("Error", "Kesalahan jaringan");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Hapus Cabang", "Apakah Anda yakin ingin menghapus cabang ini?", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Hapus", 
        style: "destructive", 
        onPress: async () => {
          try {
            const res = await fetch(endpoints.branchDetail(id), {
              method: "DELETE",
              credentials: 'include'
            });
            const data = await res.json();
            if (res.ok && data.success) {
              setBranches(branches.filter(b => b.id !== id));
            } else {
              Alert.alert("Error", data.message || "Gagal menghapus cabang");
            }
          } catch (err) {
            Alert.alert("Error", "Kesalahan jaringan");
          }
        } 
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={{ marginTop: 10, color: '#64748B', fontWeight: 'bold' }}>Memuat daftar cabang...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manajemen Cabang</Text>
          <Text style={styles.headerSubtitle}>Kelola jaringan outlet laundry Anda</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.addBtnText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBanner}>
        <View style={styles.infoIconBox}>
          <Text style={{ fontSize: 20 }}>🏢</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>FITUR ENTERPRISE EKSKLUSIF</Text>
          <Text style={styles.infoText}>
            Karena Anda berada di paket Enterprise, Anda dapat menambah cabang (outlet) tanpa batas.
          </Text>
        </View>
      </View>

      <FlatList
        data={branches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40 }}>🏪</Text>
            <Text style={styles.emptyTitle}>Belum Ada Cabang</Text>
            <Text style={styles.emptyText}>Tambahkan outlet cabang baru Anda.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.branchCard}>
            <View style={styles.branchHeader}>
              <View style={styles.branchIconBox}>
                <Text style={{ fontSize: 20 }}>🏪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.branchName}>{item.name}</Text>
                <View style={[styles.badge, item.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive]}>
                  <Text style={[styles.badgeText, item.status === 'ACTIVE' ? styles.badgeTextActive : styles.badgeTextInactive]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.branchContent}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>ALAMAT OUTLET</Text>
                <Text style={styles.value}>{item.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>KEPALA TOKO / MANAGER</Text>
                <Text style={styles.value}>{item.manager || '-'}</Text>
              </View>
            </View>

            <View style={styles.branchFooter}>
              <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit Info</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtnText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Cabang</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nama Cabang / Outlet</Text>
              <TextInput 
                style={styles.input} 
                value={newBranch.name} 
                onChangeText={(val) => setNewBranch({...newBranch, name: val})} 
                placeholder="Contoh: Cabang Antasari" 
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Alamat Lengkap</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                value={newBranch.address} 
                onChangeText={(val) => setNewBranch({...newBranch, address: val})} 
                placeholder="Jl. Antasari Raya No. 45..." 
                multiline
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Penanggung Jawab (Opsional)</Text>
              <TextInput 
                style={styles.input} 
                value={newBranch.manager} 
                onChangeText={(val) => setNewBranch({...newBranch, manager: val})} 
                placeholder="Nama Manager..." 
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateBranch} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Simpan Cabang</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#9333EA', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  
  infoBanner: { flexDirection: 'row', backgroundColor: '#FAF5FF', margin: 15, marginBottom: 0, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#F3E8FF' },
  infoIconBox: { width: 40, height: 40, backgroundColor: '#E9D5FF', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  infoTitle: { fontSize: 11, fontWeight: '900', color: '#6B21A8', marginBottom: 2 },
  infoText: { fontSize: 11, color: '#9333EA', lineHeight: 16, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 10 },
  emptyText: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 5 },

  branchCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  branchHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  branchIconBox: { width: 48, height: 48, backgroundColor: '#EFF6FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15, borderWidth: 1, borderColor: '#DBEAFE' },
  branchName: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  badgeActive: { backgroundColor: '#D1FAE5' },
  badgeInactive: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  badgeTextActive: { color: '#047857' },
  badgeTextInactive: { color: '#B91C1C' },

  branchContent: { marginBottom: 15 },
  infoRow: { marginBottom: 10 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 13, fontWeight: '600', color: '#334155' },

  branchFooter: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  editBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  editBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  deleteBtn: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#FEF2F2', borderRadius: 10, borderWidth: 1, borderColor: '#FECACA', alignItems: 'center' },
  deleteBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  formGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748B', marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  submitBtn: { backgroundColor: '#9333EA', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
