import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { endpoints } from '../config/api';
import { Picker } from '@react-native-picker/picker'; // Optional: Use standard Picker if available, else a simple custom one. For simplicity, we'll use a custom pseudo-picker for unit.

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Add Service Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newUnit, setNewUnit] = useState("KG");
  const [addLoading, setAddLoading] = useState(false);
  const [activePlanId, setActivePlanId] = useState("trial");

  const fetchServices = async () => {
    try {
      const res = await fetch(endpoints.services, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setServices(data.services);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchServices();
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.tenantTier) {
            setActivePlanId(parsed.tenantTier === "STARTER" ? "trial" : parsed.tenantTier.toLowerCase());
          } else if (parsed.email === "prolaundry@gmail.com" || parsed.name?.toLowerCase() === "pro") {
            setActivePlanId("pro");
          }
        } catch (e) {}
      }
    };
    init();
  }, []);

  const getServiceLimit = () => {
    if (activePlanId === "enterprise") return Infinity;
    if (activePlanId === "pro") return 10;
    return 3;
  };
  
  const limit = getServiceLimit();
  const currentCount = services.length;
  const canAddMore = currentCount < limit;

  const handleStartEdit = (service: Service) => {
    setEditId(service.id);
    setEditPrice(service.price.toString());
  };

  const handleSavePrice = async (serviceId: string) => {
    if (!editPrice || isNaN(parseFloat(editPrice))) return;
    setEditLoading(true);

    try {
      const res = await fetch(endpoints.serviceDetail(serviceId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ price: editPrice }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setServices(
          services.map((svc) =>
            svc.id === serviceId ? { ...svc, price: parseFloat(editPrice) } : svc
          )
        );
        setEditId(null);
        setEditPrice("");
      } else {
        Alert.alert("Error", data.message || "Gagal memperbarui harga");
      }
    } catch (err) {
      Alert.alert("Error", "Kesalahan jaringan");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert("Hapus Layanan", "Apakah Anda yakin ingin menghapus layanan ini?", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Hapus", 
        style: "destructive", 
        onPress: async () => {
          try {
            const res = await fetch(endpoints.serviceDetail(serviceId), {
              method: "DELETE",
              credentials: 'include',
            });
            const data = await res.json();
            if (res.ok && data.success) {
              setServices(services.filter((svc) => svc.id !== serviceId));
            } else {
              Alert.alert("Error", data.message || "Gagal menghapus layanan");
            }
          } catch (err) {
            Alert.alert("Error", "Kesalahan jaringan");
          }
        } 
      }
    ]);
  };

  const handleCreateService = async () => {
    if (!newName || !newPrice || !newUnit) {
      Alert.alert("Error", "Nama dan harga wajib diisi");
      return;
    }
    setAddLoading(true);

    try {
      const res = await fetch(endpoints.services, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ name: newName, price: newPrice, unit: newUnit, planId: activePlanId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setServices([...services, data.service]);
        setShowAddModal(false);
        setNewName("");
        setNewPrice("");
        setNewUnit("KG");
      } else {
        Alert.alert("Error", data.message || "Gagal menambah layanan");
      }
    } catch (err) {
      Alert.alert("Error", "Kesalahan jaringan");
    } finally {
      setAddLoading(false);
    }
  };

  const formatCurrency = (num: number) => {
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: '#64748B', fontWeight: 'bold' }}>Mengambil tarif master...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manajemen Layanan</Text>
          <Text style={styles.headerSubtitle}>Kelola jenis layanan dan tarif</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addBtn, !canAddMore && styles.addBtnDisabled]}
          onPress={() => {
            if (canAddMore) setShowAddModal(true);
            else Alert.alert("Batas Tercapai", `Batas maksimal layanan untuk paket Anda telah tercapai (${limit} layanan).`);
          }}
          disabled={!canAddMore}
        >
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.addBtnText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoTitle}>💡 Informasi Snapshot Harga</Text>
        <Text style={styles.infoText}>
          Perubahan harga master tarif hanya berlaku untuk order baru. Order lama tetap menggunakan harga lama (Anti-Fraud).
        </Text>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40 }}>📦</Text>
            <Text style={styles.emptyTitle}>Belum Ada Layanan</Text>
            <Text style={styles.emptyText}>Tambahkan master tarif layanan Anda.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <View>
                <Text style={styles.serviceName}>{item.name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Satuan: {item.unit}</Text>
                </View>
              </View>
              <View style={styles.iconBox}>
                <Text>{item.unit === "KG" ? "⚖️" : "👔"}</Text>
              </View>
            </View>

            <View style={styles.serviceFooter}>
              {editId === item.id ? (
                <View style={styles.editRow}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.saveBtn} onPress={() => handleSavePrice(item.id)} disabled={editLoading}>
                    {editLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Simpan</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditId(null)}>
                    <Text style={styles.cancelBtnText}>Batal</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <View>
                    <Text style={styles.priceLabel}>HARGA MASTER</Text>
                    <Text style={styles.priceValue}>{formatCurrency(item.price)} <Text style={styles.priceUnit}>/ {item.unit}</Text></Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleStartEdit(item)}>
                      <Ionicons name="pencil" size={16} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]} onPress={() => handleDeleteService(item.id)}>
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      />

      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Layanan</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nama Layanan</Text>
              <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Contoh: Cuci Sepatu" />
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Harga (Rp)</Text>
                <TextInput style={styles.input} value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" placeholder="0" />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Satuan</Text>
                <View style={styles.pseudoSelectContainer}>
                  <TouchableOpacity style={[styles.pseudoSelect, newUnit === 'KG' && styles.pseudoSelectActive]} onPress={() => setNewUnit('KG')}>
                    <Text style={[styles.pseudoSelectText, newUnit === 'KG' && styles.pseudoSelectTextActive]}>KG</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.pseudoSelect, newUnit === 'PCS' && styles.pseudoSelectActive]} onPress={() => setNewUnit('PCS')}>
                    <Text style={[styles.pseudoSelectText, newUnit === 'PCS' && styles.pseudoSelectTextActive]}>PCS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateService} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Simpan Layanan</Text>}
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
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  addBtnDisabled: { backgroundColor: '#94A3B8' },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  
  infoBanner: { backgroundColor: '#FFFBEB', margin: 15, marginBottom: 0, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#FEF3C7' },
  infoTitle: { fontSize: 12, fontWeight: 'bold', color: '#D97706', marginBottom: 5 },
  infoText: { fontSize: 11, color: '#92400E', lineHeight: 16 },

  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 10 },
  emptyText: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 5 },

  serviceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  serviceName: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  badge: { backgroundColor: '#F1F5F9', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  badgeText: { fontSize: 9, fontWeight: 'bold', color: '#64748B' },
  iconBox: { width: 40, height: 40, backgroundColor: '#EFF6FF', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  
  serviceFooter: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 9, fontWeight: 'bold', color: '#94A3B8' },
  priceValue: { fontSize: 18, fontWeight: '900', color: '#2563EB', fontFamily: 'monospace' },
  priceUnit: { fontSize: 10, color: '#94A3B8', fontWeight: 'normal' },
  iconBtn: { backgroundColor: '#EFF6FF', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE' },
  
  editRow: { flexDirection: 'row', alignItems: 'center' },
  currencyPrefix: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginRight: 5 },
  editInput: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 8, fontSize: 14, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#2563EB', padding: 10, borderRadius: 8, marginLeft: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  cancelBtn: { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8, marginLeft: 5 },
  cancelBtnText: { color: '#64748B', fontWeight: 'bold', fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  formGroup: { marginBottom: 15 },
  formRow: { flexDirection: 'row' },
  label: { fontSize: 11, fontWeight: 'bold', color: '#64748B', marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14 },
  pseudoSelectContainer: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  pseudoSelect: { flex: 1, padding: 12, alignItems: 'center' },
  pseudoSelectActive: { backgroundColor: '#2563EB' },
  pseudoSelectText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  pseudoSelectTextActive: { color: '#FFF' },
  submitBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
