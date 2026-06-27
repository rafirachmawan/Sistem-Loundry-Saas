import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { endpoints } from '../config/api';

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  unit: string;
}

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // States untuk Tambah Barang Baru
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // States untuk Penyesuaian Stok (Modal)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoints.inventory, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAddItem = async () => {
    if (!newName || !newUnit) {
      Alert.alert("Perhatian", "Nama barang dan Satuan Unit wajib diisi!");
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch(endpoints.inventory, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ name: newName, sku: newSku, unit: newUnit }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems([...items, data.item].sort((a, b) => a.name.localeCompare(b.name)));
        setShowAddForm(false);
        setNewName("");
        setNewSku("");
        setNewUnit("");
        Alert.alert("Sukses", "Barang baru berhasil ditambahkan.");
      } else {
        Alert.alert("Error", data.message || "Gagal menambahkan barang");
      }
    } catch (err) {
      Alert.alert("Error", "Kesalahan jaringan");
    } finally {
      setAddLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustItem || !adjustQty || Number(adjustQty) <= 0) {
      Alert.alert("Perhatian", "Kuantitas tidak valid!");
      return;
    }

    setAdjustLoading(true);
    try {
      const res = await fetch(endpoints.inventoryDetail(adjustItem.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          type: adjustType,
          quantity: Number(adjustQty),
          reason: adjustReason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(items.map(item => item.id === adjustItem.id ? data.item : item));
        setAdjustItem(null);
        setAdjustQty("");
        setAdjustReason("");
        Alert.alert("Sukses", "Stok berhasil diperbarui.");
      } else {
        Alert.alert("Error", data.message || "Gagal memperbarui stok");
      }
    } catch (err) {
      Alert.alert("Error", "Kesalahan jaringan");
    } finally {
      setAdjustLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Premium */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Stok Gudang</Text>
          <Text style={styles.headerSubtitle}>Pantau pemakaian bahan operasional</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.addBtnText}>Barang Baru</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Inventaris */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Memuat inventaris...</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 30 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Gudang Kosong</Text>
                <Text style={styles.emptyText}>Belum ada barang terdaftar di cabang ini.</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const isLowStock = item.stock <= 5;
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.skuBadge}>{item.sku || "NO-SKU"}</Text>
                  </View>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemUnit}>Satuan: {item.unit}</Text>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.stockLabel}>SISA STOK</Text>
                      <Text style={[styles.stockValue, isLowStock ? { color: '#EF4444' } : { color: '#10B981' }]}>
                        {item.stock.toFixed(1)}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.adjustBtn}
                      onPress={() => {
                        setAdjustItem(item);
                        setAdjustType("IN");
                      }}
                    >
                      <Ionicons name="swap-vertical" size={20} color="#6366F1" />
                    </TouchableOpacity>
                  </View>
                  
                  {isLowStock && <View style={styles.lowStockBar} />}
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Modal Tambah Barang */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daftarkan Barang Baru</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Barang *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Deterjen Cair Rinso"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Satuan Unit *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Liter, Kg"
                    value={newUnit}
                    onChangeText={setNewUnit}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>SKU (Opsional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: DTJ-001"
                    value={newSku}
                    onChangeText={setNewSku}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddItem} disabled={addLoading}>
                {addLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Simpan Barang</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Penyesuaian Stok */}
      <Modal visible={!!adjustItem} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlayDark}>
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeaderLight}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.dotIndicator} />
                <Text style={styles.modalTitle}>Penyesuaian Stok</Text>
              </View>
              <TouchableOpacity onPress={() => setAdjustItem(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20 }}>
              <View style={styles.adjustItemInfo}>
                <Text style={styles.adjustItemLabel}>BARANG</Text>
                <Text style={styles.adjustItemName}>{adjustItem?.name} <Text style={styles.adjustItemStock}>({adjustItem?.stock} {adjustItem?.unit})</Text></Text>
              </View>

              <View style={styles.switchRow}>
                <TouchableOpacity 
                  style={[styles.switchBtn, adjustType === 'IN' ? styles.switchInActive : styles.switchInactive]}
                  onPress={() => setAdjustType('IN')}
                >
                  <Text style={{ fontSize: 16 }}>📥</Text>
                  <Text style={[styles.switchText, adjustType === 'IN' ? styles.textInActive : styles.textInactive]}>Tambah</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.switchBtn, adjustType === 'OUT' ? styles.switchOutActive : styles.switchInactive]}
                  onPress={() => setAdjustType('OUT')}
                >
                  <Text style={{ fontSize: 16 }}>📤</Text>
                  <Text style={[styles.switchText, adjustType === 'OUT' ? styles.textOutActive : styles.textInactive]}>Kurangi</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kuantitas ({adjustItem?.unit}) *</Text>
                <TextInput
                  style={[styles.input, { textAlign: 'center', fontSize: 16, fontWeight: '900' }]}
                  placeholder="Misal: 5"
                  keyboardType="numeric"
                  value={adjustQty}
                  onChangeText={setAdjustQty}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catatan / Alasan</Text>
                <TextInput
                  style={styles.input}
                  placeholder={adjustType === "IN" ? "Misal: Beli di pasar" : "Misal: Dipakai cuci reguler"}
                  value={adjustReason}
                  onChangeText={setAdjustReason}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, adjustType === 'IN' ? { backgroundColor: '#10B981' } : { backgroundColor: '#EF4444' }]} 
                onPress={handleAdjustStock} 
                disabled={adjustLoading}
              >
                {adjustLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>{adjustType === 'IN' ? 'Simpan Penambahan' : 'Simpan Pemakaian'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 25, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366F1', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },

  content: { flex: 1, padding: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, backgroundColor: 'rgba(241, 245, 249, 0.5)', borderRadius: 20, borderWidth: 2, borderColor: '#F1F5F9', borderStyle: 'dashed' },
  emptyTitle: { color: '#64748B', fontWeight: 'bold', fontSize: 16, marginTop: 15 },
  emptyText: { color: '#94A3B8', fontSize: 12, marginTop: 5 },

  card: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1, position: 'relative', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  skuBadge: { fontSize: 9, fontWeight: '900', color: '#94A3B8', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontFamily: 'monospace' },
  itemName: { fontSize: 13, fontWeight: '900', color: '#1E293B', marginBottom: 2, height: 35 },
  itemUnit: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
  stockLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748B', marginBottom: 2 },
  stockValue: { fontSize: 24, fontWeight: '900', fontFamily: 'monospace', letterSpacing: -1 },
  
  adjustBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  lowStockBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: '#EF4444' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  
  inputGroup: { marginBottom: 15 },
  rowInputs: { flexDirection: 'row' },
  inputLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  
  submitBtn: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  modalOverlayDark: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', padding: 20 },
  modalContentSmall: { backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden' },
  modalHeaderLight: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dotIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1', marginRight: 8 },
  
  adjustItemInfo: { marginBottom: 20 },
  adjustItemLabel: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', marginBottom: 2 },
  adjustItemName: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  adjustItemStock: { fontSize: 14, fontWeight: '500', color: '#64748B' },

  switchRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  switchBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 6 },
  switchInactive: { backgroundColor: '#FFF', borderColor: '#E2E8F0' },
  switchInActive: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  switchOutActive: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  textInactive: { fontWeight: 'bold', fontSize: 12, color: '#64748B' },
  textInActive: { fontWeight: '900', fontSize: 12, color: '#059669' },
  textOutActive: { fontWeight: '900', fontSize: 12, color: '#DC2626' },
});
