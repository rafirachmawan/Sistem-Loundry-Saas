import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput, Modal, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { endpoints } from '../config/api';

interface Branch {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "KASIR" | "OWNER";
  branch: Branch | null;
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tier, setTier] = useState<string>("TRIAL");
  const [maxUsers, setMaxUsers] = useState<number>(3);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "KASIR",
    branchId: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(endpoints.users, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
        setBranches(data.branches || []);
        setTier(data.tier || "TRIAL");
        setMaxUsers(data.maxUsers !== undefined ? data.maxUsers : 3);
      } else {
        Alert.alert("Error", data.message || "Gagal memuat pengguna");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ name: "", email: "", phone: "", password: "", role: "KASIR", branchId: "" });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setIsEditMode(true);
    setEditId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: user.role,
      branchId: user.branch?.id || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert("Error", "Nama dan email wajib diisi");
      return;
    }
    setFormLoading(true);

    try {
      const url = isEditMode ? endpoints.userDetail(editId!) : endpoints.users;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        fetchUsers();
        Alert.alert("Sukses", `Pengguna berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}`);
      } else {
        Alert.alert("Error", data.message || "Gagal menyimpan data pengguna");
      }
    } catch (err) {
      Alert.alert("Error", "Kesalahan jaringan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (userId: string) => {
    Alert.alert("Hapus Pengguna", "Apakah Anda yakin ingin menghapus pengguna ini?", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Hapus", 
        style: "destructive", 
        onPress: async () => {
          try {
            const res = await fetch(endpoints.userDetail(userId), {
              method: "DELETE",
              credentials: 'include'
            });
            const data = await res.json();
            if (res.ok && data.success) {
              fetchUsers();
            } else {
              Alert.alert("Error", data.message || "Gagal menghapus pengguna");
            }
          } catch (err) {
            Alert.alert("Error", "Kesalahan jaringan");
          }
        } 
      }
    ]);
  };

  const isLimitReached = maxUsers !== -1 && users.length >= maxUsers;
  const progressPercent = maxUsers === -1 ? 100 : Math.min((users.length / maxUsers) * 100, 100);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: '#64748B', fontWeight: 'bold' }}>Memuat pengguna...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manajemen Pengguna</Text>
          <Text style={styles.headerSubtitle}>Kelola akses akun tim Anda</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addBtn, isLimitReached && styles.addBtnDisabled]} 
          onPress={() => {
            if (isLimitReached) {
              Alert.alert("Batas Maksimal", "Kuota pengguna Anda telah penuh. Silakan upgrade paket.");
            } else {
              openAddModal();
            }
          }}
          disabled={isLimitReached}
        >
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.addBtnText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quotaBox}>
        <View style={styles.quotaHeader}>
          <Text style={styles.quotaTitle}>Kuota Paket: <Text style={{ color: '#2563EB' }}>{tier}</Text></Text>
          <Text style={styles.quotaSubtitle}>Anda telah menggunakan {users.length} dari {maxUsers === -1 ? "Tak Terbatas" : maxUsers} pengguna.</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: isLimitReached ? '#EF4444' : '#2563EB' }]} />
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <View style={[styles.roleBadge, item.role === 'OWNER' ? styles.roleOwner : styles.roleKasir]}>
                    <Text style={[styles.roleText, item.role === 'OWNER' ? styles.roleTextOwner : styles.roleTextKasir]}>
                      {item.role}
                    </Text>
                  </View>
                </View>
                <Text style={styles.userInfoText}>{item.email}</Text>
                {item.phone ? <Text style={styles.userInfoText}>{item.phone}</Text> : null}
                
                {item.branch && (
                  <View style={styles.branchBadge}>
                    <Text style={styles.branchIcon}>🏪</Text>
                    <Text style={styles.branchText}>{item.branch.name}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.userFooter}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtnText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditMode ? "Edit Pengguna" : "Tambah Pengguna"}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <TextInput style={styles.input} value={formData.name} onChangeText={(val) => setFormData({...formData, name: val})} />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Email (Username)</Text>
                <TextInput style={styles.input} value={formData.email} onChangeText={(val) => setFormData({...formData, email: val})} keyboardType="email-address" autoCapitalize="none" />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>No. WhatsApp</Text>
                <TextInput style={styles.input} value={formData.phone} onChangeText={(val) => setFormData({...formData, phone: val})} keyboardType="phone-pad" />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput style={styles.input} value={formData.password} onChangeText={(val) => setFormData({...formData, password: val})} placeholder={isEditMode ? "Biarkan kosong jika tidak diubah" : ""} secureTextEntry={!isEditMode} />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Role</Text>
                  <View style={styles.pseudoSelectContainer}>
                    <TouchableOpacity style={[styles.pseudoSelect, formData.role === 'KASIR' && styles.pseudoSelectActive]} onPress={() => setFormData({...formData, role: 'KASIR'})}>
                      <Text style={[styles.pseudoSelectText, formData.role === 'KASIR' && styles.pseudoSelectTextActive]}>Kasir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.pseudoSelect, formData.role === 'OWNER' && styles.pseudoSelectActive]} onPress={() => setFormData({...formData, role: 'OWNER'})}>
                      <Text style={[styles.pseudoSelectText, formData.role === 'OWNER' && styles.pseudoSelectTextActive]}>Owner</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {tier === "ENTERPRISE" && formData.role === "KASIR" && (
                <View style={[styles.formGroup, { backgroundColor: '#FAF5FF', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#F3E8FF' }]}>
                  <Text style={[styles.inputLabel, { color: '#6B21A8' }]}>Tugaskan ke Cabang (Opsional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
                    <TouchableOpacity 
                      style={[styles.branchPill, formData.branchId === "" && styles.branchPillActive]} 
                      onPress={() => setFormData({...formData, branchId: ""})}
                    >
                      <Text style={[styles.branchPillText, formData.branchId === "" && styles.branchPillTextActive]}>Pusat / Semua</Text>
                    </TouchableOpacity>
                    {branches.map(b => (
                      <TouchableOpacity 
                        key={b.id} 
                        style={[styles.branchPill, formData.branchId === b.id && styles.branchPillActive]} 
                        onPress={() => setFormData({...formData, branchId: b.id})}
                      >
                        <Text style={[styles.branchPillText, formData.branchId === b.id && styles.branchPillTextActive]}>{b.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={{ fontSize: 9, color: '#9333EA', marginTop: 8 }}>Pilih cabang untuk mengelompokkan Kasir ke outlet tertentu.</Text>
                </View>
              )}

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={formLoading}>
                {formLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Simpan Pengguna</Text>}
              </TouchableOpacity>
            </ScrollView>
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
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  addBtnDisabled: { backgroundColor: '#94A3B8' },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  
  quotaBox: { backgroundColor: '#FFFFFF', margin: 15, marginBottom: 0, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  quotaHeader: { marginBottom: 10 },
  quotaTitle: { fontSize: 13, fontWeight: '900', color: '#1E293B' },
  quotaSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  progressBarBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },

  userCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  userHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  userAvatar: { width: 44, height: 44, backgroundColor: '#DBEAFE', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  userAvatarText: { fontSize: 18, fontWeight: '900', color: '#2563EB' },
  userName: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
  userInfoText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleOwner: { backgroundColor: '#FEF3C7' },
  roleKasir: { backgroundColor: '#F1F5F9' },
  roleText: { fontSize: 9, fontWeight: '900' },
  roleTextOwner: { color: '#D97706' },
  roleTextKasir: { color: '#475569' },

  branchBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF5FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8, borderWidth: 1, borderColor: '#F3E8FF' },
  branchIcon: { fontSize: 10, marginRight: 4 },
  branchText: { fontSize: 10, fontWeight: 'bold', color: '#7E22CE' },

  userFooter: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  editBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#EFF6FF', borderRadius: 10, alignItems: 'center' },
  editBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 12 },
  deleteBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#FEF2F2', borderRadius: 10, alignItems: 'center' },
  deleteBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  formGroup: { marginBottom: 15 },
  formRow: { flexDirection: 'row' },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  
  pseudoSelectContainer: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  pseudoSelect: { flex: 1, padding: 12, alignItems: 'center' },
  pseudoSelectActive: { backgroundColor: '#2563EB' },
  pseudoSelectText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  pseudoSelectTextActive: { color: '#FFF' },
  
  branchPill: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#E9D5FF', marginRight: 8 },
  branchPillActive: { backgroundColor: '#9333EA', borderColor: '#9333EA' },
  branchPillText: { fontSize: 11, fontWeight: 'bold', color: '#9333EA' },
  branchPillTextActive: { color: '#FFF' },

  submitBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
