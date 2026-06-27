import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, ScrollView, ActivityIndicator, Alert, Modal
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
    Alert.alert("Ditambahkan", `${service.name} masuk keranjang.`);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...orderItems];
    const newQty = updated[index].quantity + delta;
    if (newQty >= 0.1) {
      updated[index].quantity = newQty;
      setOrderItems(updated);
    } else {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      Alert.alert("Gagal", "Silakan pilih pelanggan terlebih dahulu.");
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
      {/* 1. Hubungkan Pelanggan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Hubungkan Pelanggan</Text>
        {selectedCustomer ? (
          <View style={styles.selectedCustomerCard}>
            <View>
              <Text style={styles.customerName}>{selectedCustomer.name}</Text>
              <Text style={styles.customerPhone}>{selectedCustomer.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Cari nama atau WhatsApp..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {customerLoading && <ActivityIndicator size="small" color="#2563EB" style={{marginRight: 10}} />}
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
                    <Text style={styles.dropdownItemText}>{c.name} - {c.phone}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* 2. Layanan Grid */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>2. Pilih Layanan</Text>
          <TextInput 
            style={[styles.searchInput, {width: 150, paddingLeft: 10, height: 35}]}
            placeholder="Cari..."
            value={serviceSearch}
            onChangeText={setServiceSearch}
          />
        </View>

        {servicesLoading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{marginTop: 20}} />
        ) : (
          <FlatList 
            data={filteredServices}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={{paddingBottom: 80}}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            renderItem={({item}) => (
              <TouchableOpacity style={styles.serviceCard} onPress={() => handleAddItem(item)}>
                <Text style={styles.serviceUnit}>/ {item.unit}</Text>
                <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.servicePrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
                <Ionicons name="add-circle" size={24} color="#10B981" style={styles.addIcon} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Floating Cart Button */}
      {orderItems.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCartModal(true)}>
          <Ionicons name="cart" size={24} color="#FFF" />
          <Text style={styles.fabText}>{orderItems.length} Item - Rp {totalPrice.toLocaleString('id-ID')}</Text>
        </TouchableOpacity>
      )}

      {/* Cart Modal */}
      <Modal visible={showCartModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ringkasan Transaksi</Text>
              <TouchableOpacity onPress={() => setShowCartModal(false)}>
                <Ionicons name="close" size={28} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartList}>
              {orderItems.map((item, idx) => (
                <View key={idx} style={styles.cartItem}>
                  <View style={{flex: 1}}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
                  </View>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(idx, -1)} style={styles.qtyBtn}>
                      <Text style={styles.qtyText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(idx, 1)} style={styles.qtyBtn}>
                      <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.rowBetween}>
                <Text style={styles.totalLabel}>Total Tagihan</Text>
                <Text style={styles.totalValue}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
              </View>
              
              <View style={styles.paymentSwitch}>
                <TouchableOpacity 
                  style={[styles.switchBtn, paymentTerm === 'PREPAID' && styles.switchActiveBtn]}
                  onPress={() => setPaymentTerm('PREPAID')}
                >
                  <Text style={[styles.switchText, paymentTerm === 'PREPAID' && styles.switchActiveText]}>LUNAS</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.switchBtn, paymentTerm === 'POSTPAID' && styles.switchActiveBtnAmber]}
                  onPress={() => setPaymentTerm('POSTPAID')}
                >
                  <Text style={[styles.switchText, paymentTerm === 'POSTPAID' && styles.switchActiveText]}>NANTI</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.checkoutBtn} 
                onPress={handleCheckout} 
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.checkoutText}>Simpan Pesanan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 15,
  },
  section: {
    marginBottom: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 50,
  },
  searchIcon: {
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600'
  },
  selectedCustomerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 15,
    borderRadius: 12,
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1E3A8A',
  },
  customerPhone: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    position: 'relative'
  },
  serviceUnit: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  addIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2563EB',
    borderRadius: 15,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cartList: {
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cartItemName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1E293B',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
  },
  qtyValue: {
    width: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2563EB',
  },
  cartFooter: {
    borderTopWidth: 2,
    borderTopColor: '#F1F5F9',
    paddingTop: 15,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
  },
  paymentSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginVertical: 15,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  switchActiveBtn: {
    backgroundColor: '#2563EB',
  },
  switchActiveBtnAmber: {
    backgroundColor: '#F59E0B',
  },
  switchText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#64748B',
  },
  switchActiveText: {
    color: '#FFFFFF',
  },
  checkoutBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
