import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, ScrollView, ActivityIndicator, Alert, Modal, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { endpoints } from '../config/api';

export default function KasirScreen() {
  // States Pelanggan
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);

  // States Layanan
  const [services, setServices] = useState<any[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [servicesLoading, setServicesLoading] = useState(true);

  // States Cart
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [paymentTerm, setPaymentTerm] = useState<"PREPAID" | "POSTPAID">("PREPAID");
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [showCartModal, setShowCartModal] = useState(false);

  // Fetch Layanan
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(endpoints.services, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setServices(data.services);
        }
      } catch (err) {
        console.error("Gagal load services:", err);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Handler Cari Pelanggan
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const delayFn = setTimeout(async () => {
      setCustomerLoading(true);
      try {
        const res = await fetch(`${endpoints.customers}?search=${encodeURIComponent(searchQuery)}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.customers);
        }
      } catch (e) {} finally {
        setCustomerLoading(false);
      }
    }, 500);
    return () => clearTimeout(delayFn);
  }, [searchQuery]);

  const handleAddItem = (service: any) => {
    const existingIndex = orderItems.findIndex(item => item.serviceId === service.id);
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, { ...service, serviceId: service.id, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...orderItems];
    const newQty = updated[index].quantity + delta;
    if (newQty > 0) {
      updated[index].quantity = newQty;
      setOrderItems(updated);
    } else {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      Alert.alert("Perhatian", "Silakan pilih pelanggan terlebih dahulu.");
      setShowCartModal(false);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomer.id,
        paymentTerm,
        items: orderItems.map(i => ({ serviceId: i.serviceId, quantity: i.quantity })),
        amountPaid: 0
      };
      const res = await fetch(endpoints.orders, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Sukses", "Pesanan berhasil disimpan!");
        setOrderItems([]);
        setSelectedCustomer(null);
        setSearchQuery("");
        setShowCartModal(false);
      } else {
        Alert.alert("Error", data.message || "Gagal menyimpan pesanan.");
      }
    } catch (e) {
      Alert.alert("Error", "Masalah jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()));

  return (
    <View style={styles.container}>
      {/* Header Premium */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Point of Sale</Text>
          <Text style={styles.headerSubtitle}>Proses pesanan laundry dengan cepat</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="basket" size={24} color="#2563EB" />
        </View>
      </View>

      <View style={styles.content}>
        {/* 1. Hubungkan Pelanggan */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Hubungkan Pelanggan</Text>
          </View>

          {selectedCustomer ? (
            <View style={styles.selectedCustomerCard}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerAvatarText}>{selectedCustomer.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                <Text style={styles.customerPhone}>{selectedCustomer.phone}</Text>
              </View>
              <TouchableOpacity style={styles.removeCustomerBtn} onPress={() => setSelectedCustomer(null)}>
                <Ionicons name="close" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ position: 'relative', zIndex: 10 }}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Cari nama atau nomor WhatsApp..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {customerLoading && <ActivityIndicator size="small" color="#2563EB" style={{marginRight: 15}} />}
              </View>
              
              {searchResults.length > 0 && (
                <View style={styles.dropdown}>
                  {searchResults.map(c => (
                    <TouchableOpacity 
                      key={c.id} 
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCustomer(c);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <View style={styles.dropdownAvatar}>
                        <Ionicons name="person" size={14} color="#64748B" />
                      </View>
                      <View>
                        <Text style={styles.dropdownItemText}>{c.name}</Text>
                        <Text style={styles.dropdownItemSub}>{c.phone}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* 2. Layanan Grid */}
        <View style={[styles.sectionCard, { flex: 1, zIndex: 1 }]}>
          <View style={styles.rowBetween}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Pilih Layanan</Text>
            </View>
            <View style={styles.miniSearch}>
              <Ionicons name="search" size={14} color="#94A3B8" />
              <TextInput 
                style={styles.miniSearchInput}
                placeholder="Cari menu..."
                placeholderTextColor="#94A3B8"
                value={serviceSearch}
                onChangeText={setServiceSearch}
              />
            </View>
          </View>

          {servicesLoading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{marginTop: 40}} />
          ) : (
            <FlatList 
              data={filteredServices}
              keyExtractor={item => item.id}
              numColumns={2}
              contentContainerStyle={{paddingBottom: 100, paddingTop: 10}}
              columnWrapperStyle={{justifyContent: 'space-between'}}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => {
                const qty = orderItems.find(i => i.serviceId === item.id)?.quantity || 0;
                return (
                  <View style={[styles.serviceCard, qty > 0 && styles.serviceCardActive]}>
                    <View style={styles.serviceUnitBadge}>
                      <Text style={styles.serviceUnitText}>{item.unit}</Text>
                    </View>
                    
                    <Text style={styles.serviceName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.servicePrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
                    
                    <TouchableOpacity 
                      style={[styles.addBtn, qty > 0 && styles.addBtnActive]} 
                      onPress={() => handleAddItem(item)}
                    >
                      <Ionicons name="add" size={18} color={qty > 0 ? "#FFF" : "#2563EB"} />
                      <Text style={[styles.addBtnText, qty > 0 && {color: '#FFF'}]}>
                        {qty > 0 ? `${qty} Ditambahkan` : "Tambah"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>

      {/* Premium Floating Cart Button */}
      {orderItems.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => setShowCartModal(true)}>
            <View style={styles.fabLeft}>
              <View style={styles.fabIconBox}>
                <Ionicons name="cart" size={20} color="#2563EB" />
                <View style={styles.fabBadge}>
                  <Text style={styles.fabBadgeText}>{orderItems.length}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.fabLabel}>Total Belanja</Text>
                <Text style={styles.fabPrice}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
              </View>
            </View>
            <View style={styles.fabRight}>
              <Text style={styles.fabActionText}>Checkout</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Premium Cart Modal */}
      <Modal visible={showCartModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Ringkasan Transaksi</Text>
                <Text style={styles.modalSubtitle}>{orderItems.length} Layanan dipilih</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCartModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
              {orderItems.map((item, idx) => (
                <View key={idx} style={styles.cartItem}>
                  <View style={styles.cartItemIconBox}>
                    <Text style={{fontSize: 16}}>{item.unit === 'KG' ? '⚖️' : '👔'}</Text>
                  </View>
                  <View style={{flex: 1, paddingRight: 10}}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>Rp {item.price.toLocaleString('id-ID')} / {item.unit}</Text>
                  </View>
                  
                  <View style={styles.qtyControl}>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(idx, -1)} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={16} color="#64748B" />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(idx, 1)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={16} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
              </View>
              <View style={[styles.summaryRow, { marginBottom: 15 }]}>
                <Text style={styles.summaryLabelTotal}>Total Tagihan</Text>
                <Text style={styles.summaryValueTotal}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
              </View>
              
              <Text style={styles.paymentMethodLabel}>Metode Pembayaran</Text>
              <View style={styles.paymentSwitch}>
                <TouchableOpacity 
                  style={[styles.switchBtn, paymentTerm === 'PREPAID' && styles.switchActiveBtn]}
                  onPress={() => setPaymentTerm('PREPAID')}
                >
                  <Ionicons name="cash" size={16} color={paymentTerm === 'PREPAID' ? '#FFF' : '#64748B'} />
                  <Text style={[styles.switchText, paymentTerm === 'PREPAID' && styles.switchActiveText]}>BAYAR SEKARANG</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.switchBtn, paymentTerm === 'POSTPAID' && styles.switchActiveBtnAmber]}
                  onPress={() => setPaymentTerm('POSTPAID')}
                >
                  <Ionicons name="time" size={16} color={paymentTerm === 'POSTPAID' ? '#FFF' : '#64748B'} />
                  <Text style={[styles.switchText, paymentTerm === 'POSTPAID' && styles.switchActiveText]}>BAYAR NANTI</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.checkoutBtn} 
                onPress={handleCheckout} 
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.checkoutText}>Konfirmasi Pesanan</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 25, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  headerIcon: { width: 44, height: 44, backgroundColor: '#EFF6FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  content: { flex: 1, padding: 15 },
  
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  stepBadge: { width: 24, height: 24, backgroundColor: '#2563EB', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  stepBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, height: 50 },
  searchIcon: { paddingHorizontal: 15 },
  searchInput: { flex: 1, height: '100%', fontSize: 14, color: '#0F172A', fontWeight: '500' },
  
  dropdown: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, maxHeight: 180, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5, zIndex: 100 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownAvatar: { width: 32, height: 32, backgroundColor: '#F1F5F9', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dropdownItemText: { fontSize: 14, color: '#1E293B', fontWeight: '800' },
  dropdownItemSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  
  selectedCustomerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', padding: 12, borderRadius: 12 },
  customerAvatar: { width: 40, height: 40, backgroundColor: '#DBEAFE', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  customerAvatarText: { fontSize: 16, fontWeight: '900', color: '#2563EB' },
  customerName: { fontWeight: '900', fontSize: 15, color: '#1E3A8A' },
  customerPhone: { fontSize: 12, color: '#3B82F6', marginTop: 2, fontWeight: '600' },
  removeCustomerBtn: { width: 30, height: 30, backgroundColor: '#FEE2E2', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  miniSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, height: 36, paddingHorizontal: 10, width: 140 },
  miniSearchInput: { flex: 1, marginLeft: 6, fontSize: 12, color: '#1E293B' },
  
  serviceCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  serviceCardActive: { borderColor: '#BFDBFE', backgroundColor: '#F8FAFC' },
  serviceUnitBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  serviceUnitText: { fontSize: 9, fontWeight: '900', color: '#64748B' },
  serviceName: { fontSize: 14, fontWeight: '900', color: '#1E293B', marginTop: 20, marginBottom: 5, height: 38 },
  servicePrice: { fontSize: 14, fontWeight: '900', color: '#2563EB', fontFamily: 'monospace', marginBottom: 15 },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE' },
  addBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  addBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },

  fabContainer: { position: 'absolute', bottom: 20, left: 15, right: 15 },
  fab: { backgroundColor: '#1E293B', borderRadius: 16, height: 65, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  fabLeft: { flexDirection: 'row', alignItems: 'center' },
  fabIconBox: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, position: 'relative' },
  fabBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  fabBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  fabLabel: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  fabPrice: { color: '#FFF', fontWeight: '900', fontSize: 16, fontFamily: 'monospace', marginTop: 2 },
  fabRight: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  fabActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, marginRight: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  modalSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },
  closeBtn: { width: 36, height: 36, backgroundColor: '#F1F5F9', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  
  cartList: { paddingHorizontal: 20 },
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  cartItemIconBox: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cartItemName: { fontWeight: '900', fontSize: 14, color: '#1E293B' },
  cartItemPrice: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '600' },
  
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', padding: 2 },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  qtyValue: { width: 32, textAlign: 'center', fontWeight: '900', color: '#1E293B', fontSize: 14 },
  
  cartFooter: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  summaryLabelTotal: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  summaryValueTotal: { fontSize: 20, fontWeight: '900', color: '#2563EB', fontFamily: 'monospace' },
  
  paymentMethodLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 },
  paymentSwitch: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  switchBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  switchActiveBtn: { backgroundColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 0.2, shadowRadius: 5, elevation: 2 },
  switchActiveBtnAmber: { backgroundColor: '#F59E0B', shadowColor: '#F59E0B', shadowOpacity: 0.2, shadowRadius: 5, elevation: 2 },
  switchText: { fontWeight: '900', fontSize: 11, color: '#64748B', marginLeft: 6 },
  switchActiveText: { color: '#FFFFFF' },
  
  checkoutBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  checkoutText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, marginRight: 8 },
});
