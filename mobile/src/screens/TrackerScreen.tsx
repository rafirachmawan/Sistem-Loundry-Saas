import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { endpoints } from '../config/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width * 0.85;

interface OrderItem {
  id: string;
  quantity: number;
  service: {
    name: string;
    unit: string;
  };
}

interface Order {
  id: string;
  invoiceNumber: string;
  status: "QUEUED" | "IN_PROGRESS" | "READY" | "COMPLETED";
  paymentTerm: "PREPAID" | "POSTPAID";
  paymentStatus: "PAID" | "UNPAID";
  totalPrice: number;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
  };
  items: OrderItem[];
}

export default function TrackerScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(endpoints.orders, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // Auto sync every 30s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(`${orderId}-status`);
    try {
      const res = await fetch(endpoints.orderDetail(orderId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus as any } : ord))
        );
      } else {
        Alert.alert("Error", data.message || "Gagal memperbarui status");
      }
    } catch (err) {
      Alert.alert("Error", "Kesalahan jaringan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCollectPayment = async (orderId: string) => {
    setActionLoading(`${orderId}-pay`);
    try {
      const res = await fetch(endpoints.orderDetail(orderId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ paymentStatus: "PAID" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, paymentStatus: "PAID" } : ord))
        );
        Alert.alert("Sukses", "Pelunasan berhasil dicatat");
      } else {
        Alert.alert("Error", data.message || "Gagal mencatat pelunasan");
      }
    } catch (err) {
      Alert.alert("Error", "Kesalahan jaringan");
    } finally {
      setActionLoading(null);
    }
  };

  const queuedOrders = orders.filter((o) => o.status === "QUEUED");
  const inProgressOrders = orders.filter((o) => o.status === "IN_PROGRESS");
  const readyOrders = orders.filter((o) => o.status === "READY");
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  const OrderCard = ({ order, children }: { order: Order; children?: React.ReactNode }) => {
    const isPayLoading = actionLoading === `${order.id}-pay`;
    const isStatusLoading = actionLoading === `${order.id}-status`;
    const isUnpaidPostpaid = order.paymentTerm === "POSTPAID" && order.paymentStatus === "UNPAID";
    const shouldGlow = order.status === "READY" && isUnpaidPostpaid;

    const getProgress = () => {
      switch (order.status) {
        case "QUEUED": return { width: "15%", color: "#94A3B8" }; // slate-400
        case "IN_PROGRESS": return { width: "50%", color: "#3B82F6" }; // blue-500
        case "READY": return { width: "90%", color: "#10B981" }; // emerald-500
        case "COMPLETED": return { width: "100%", color: "#64748B" }; // slate-500
        default: return { width: "0%", color: "#94A3B8" };
      }
    };
    const progress = getProgress();

    return (
      <View style={[styles.card, shouldGlow && styles.cardGlow]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName} numberOfLines={1}>{order.customer.name}</Text>
            <Text style={styles.invoiceNumber}>{order.invoiceNumber}</Text>
          </View>
          <View style={[styles.paymentBadge, order.paymentStatus === 'PAID' ? styles.badgePaid : styles.badgeUnpaid]}>
            <Text style={[styles.paymentBadgeText, order.paymentStatus === 'PAID' ? styles.textPaid : styles.textUnpaid]}>
              {order.paymentStatus === 'PAID' ? 'LUNAS' : 'PIUTANG'}
            </Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {order.items.map((item) => (
            <Text key={item.id} style={styles.itemText} numberOfLines={1}>
              • {item.service.name} <Text style={{ color: '#94A3B8' }}>({item.quantity} {item.service.unit})</Text>
            </Text>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>Rp {order.totalPrice.toLocaleString("id-ID")}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>PROGRESS</Text>
            <Text style={styles.progressPercent}>{progress.width}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: progress.width as any, backgroundColor: progress.color }]} />
          </View>
        </View>

        {(isPayLoading || isStatusLoading) ? (
          <View style={styles.actionLoadingOverlay}>
            <ActivityIndicator color="#2563EB" />
          </View>
        ) : (
          children && <View style={styles.actionContainer}>{children}</View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Menyelaraskan papan produksi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Visual Tracker</Text>
          <Text style={styles.headerSubtitle}>Pantau status pengerjaan pakaian</Text>
        </View>
        <View style={styles.syncBadge}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Auto-Sync</Text>
        </View>
      </View>

      {/* Horizontal Kanban Board */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.kanbanContainer}
        snapToInterval={COLUMN_WIDTH + 15}
        decelerationRate="fast"
      >
        {/* Kolom 1: Antrean Masuk */}
        <View style={styles.column}>
          <View style={styles.columnHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.columnIndicator, { backgroundColor: '#94A3B8' }]} />
              <Text style={styles.columnTitle}>Antrean Masuk</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{queuedOrders.length}</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
            {queuedOrders.length === 0 ? (
              <Text style={styles.emptyText}>Tidak ada cucian</Text>
            ) : (
              queuedOrders.map(ord => (
                <OrderCard key={ord.id} order={ord}>
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: '#2563EB' }]} 
                    onPress={() => handleUpdateStatus(ord.id, "IN_PROGRESS")}
                  >
                    <Text style={styles.btnText}>Mulai Cuci</Text>
                  </TouchableOpacity>
                </OrderCard>
              ))
            )}
          </ScrollView>
        </View>

        {/* Kolom 2: Sedang Diproses */}
        <View style={styles.column}>
          <View style={styles.columnHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.columnIndicator, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.columnTitle}>Sedang Diproses</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{inProgressOrders.length}</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
            {inProgressOrders.length === 0 ? (
              <Text style={styles.emptyText}>Tidak ada cucian</Text>
            ) : (
              inProgressOrders.map(ord => (
                <OrderCard key={ord.id} order={ord}>
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: '#2563EB' }]} 
                    onPress={() => handleUpdateStatus(ord.id, "READY")}
                  >
                    <Text style={styles.btnText}>Selesai Produksi</Text>
                  </TouchableOpacity>
                </OrderCard>
              ))
            )}
          </ScrollView>
        </View>

        {/* Kolom 3: Siap Diambil */}
        <View style={styles.column}>
          <View style={styles.columnHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.columnIndicator, { backgroundColor: '#10B981' }]} />
              <Text style={styles.columnTitle}>Siap Diambil</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{readyOrders.length}</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
            {readyOrders.length === 0 ? (
              <Text style={styles.emptyText}>Tidak ada cucian</Text>
            ) : (
              readyOrders.map(ord => {
                const isUnpaidPostpaid = ord.paymentTerm === "POSTPAID" && ord.paymentStatus === "UNPAID";
                return (
                  <OrderCard key={ord.id} order={ord}>
                    <View style={{ gap: 8 }}>
                      {isUnpaidPostpaid && (
                        <TouchableOpacity 
                          style={[styles.btn, { backgroundColor: '#F59E0B' }]} 
                          onPress={() => handleCollectPayment(ord.id)}
                        >
                          <Text style={styles.btnText}>💵 Terima Pelunasan</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={[styles.btn, isUnpaidPostpaid ? styles.btnDisabled : { backgroundColor: '#10B981' }]} 
                        onPress={() => handleUpdateStatus(ord.id, "COMPLETED")}
                        disabled={isUnpaidPostpaid}
                      >
                        <Text style={[styles.btnText, isUnpaidPostpaid && { color: '#94A3B8' }]}>
                          {isUnpaidPostpaid ? "🔒 Ambil (Lunasi Dulu)" : "Konfirmasi Diambil"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </OrderCard>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Kolom 4: Selesai / Diambil */}
        <View style={[styles.column, { marginRight: 30 }]}>
          <View style={styles.columnHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.columnIndicator, { backgroundColor: '#64748B' }]} />
              <Text style={styles.columnTitle}>Selesai / Diambil</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{completedOrders.length}</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.columnContent}>
            {completedOrders.length === 0 ? (
              <Text style={styles.emptyText}>Tidak ada histori</Text>
            ) : (
              completedOrders.map(ord => (
                <OrderCard key={ord.id} order={ord} />
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 25, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  syncBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#DBEAFE' },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6', marginRight: 6 },
  syncText: { color: '#2563EB', fontWeight: 'bold', fontSize: 10 },

  kanbanContainer: { padding: 15, paddingRight: 0 },
  column: { width: COLUMN_WIDTH, backgroundColor: 'rgba(241, 245, 249, 0.5)', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, marginRight: 15, maxHeight: '100%' },
  columnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 12 },
  columnIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  columnTitle: { fontSize: 13, fontWeight: '900', color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 },
  countBadge: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  countBadgeText: { fontSize: 11, fontWeight: '900', color: '#64748B', fontFamily: 'monospace' },
  
  columnContent: { paddingBottom: 20 },
  emptyText: { textAlign: 'center', color: '#94A3B8', fontStyle: 'italic', fontSize: 12, marginTop: 20, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', padding: 15, borderRadius: 12 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
  cardGlow: { borderColor: '#FBBF24', shadowColor: '#F59E0B', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  customerName: { fontSize: 14, fontWeight: '900', color: '#1E293B' },
  invoiceNumber: { fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', fontWeight: 'bold', marginTop: 2 },
  
  paymentBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  badgePaid: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  textPaid: { color: '#059669', fontSize: 9, fontWeight: '900' },
  badgeUnpaid: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  textUnpaid: { color: '#DC2626', fontSize: 9, fontWeight: '900' },

  itemsList: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 10, marginVertical: 10 },
  itemText: { fontSize: 11, color: '#475569', fontWeight: '600', marginBottom: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  totalPrice: { fontSize: 13, fontWeight: '900', color: '#2563EB', fontFamily: 'monospace' },

  progressContainer: { marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 9, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase' },
  progressPercent: { fontSize: 9, fontWeight: 'bold', color: '#94A3B8', fontFamily: 'monospace' },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  actionContainer: { paddingTop: 10 },
  actionLoadingOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center', borderRadius: 12, zIndex: 10 },
  
  btn: { paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  btnDisabled: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', shadowOpacity: 0, elevation: 0 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});
