import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect, Text as SvgText, G, Line } from 'react-native-svg';
import { endpoints } from '../config/api';

interface UnpaidAlert {
  id: string;
  invoiceNumber: string;
  totalPrice: number;
  createdAt: string;
  customer: { name: string; phone: string; };
}

interface ChartData {
  date: string;
  volume: number;
  rawDate: string;
}

interface LowStockAlert {
  id: string;
  name: string;
  stock: number;
  unit: string;
  branch: { name: string; };
}

interface AnalyticsData {
  omsetToday: number;
  omsetTotal: number;
  piutangBerjalan: number;
  ordersTodayCount: number;
  unpaidAlerts: UnpaidAlert[];
  chartData: ChartData[];
  lowStockAlerts: LowStockAlert[];
}

export default function DashboardOwnerScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [remindLoading, setRemindLoading] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(endpoints.analytics, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalytics(data.data);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Gagal memuat analitik");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Kesalahan koneksi jaringan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSendReminder = async (orderId: string) => {
    setRemindLoading(orderId);
    try {
      const res = await fetch(endpoints.remind, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert("Sukses", "Pengingat WA berhasil dikirim!");
      } else {
        Alert.alert("Gagal", data.message || "Gagal mengirim pengingat");
      }
    } catch (err) {
      Alert.alert("Error", "Kesalahan koneksi jaringan");
    } finally {
      setRemindLoading(null);
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const created = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Hari ini" : `${diffDays} hari lalu`;
  };

  const formatCurrency = (num: number) => {
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: '#64748B', fontWeight: 'bold' }}>Menghitung metrik finansial...</Text>
      </View>
    );
  }

  if (errorMsg || !analytics) {
    return (
      <View style={styles.center}>
        <Ionicons name="warning" size={48} color="#EF4444" />
        <Text style={{ color: '#EF4444', fontWeight: 'bold', marginTop: 10 }}>{errorMsg || "Gagal memuat data"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchDashboardData}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const maxVolume = analytics.chartData 
    ? Math.max(...analytics.chartData.map((d) => d.volume), 10) 
    : 10;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* 1. KEY FINANCIAL METRICS */}
      <View style={styles.gridContainer}>
        {/* Card Omset */}
        <View style={[styles.card, { borderColor: '#10B98120', backgroundColor: '#F0FDF4' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Omset Hari Ini</Text>
            <View style={styles.cardIconBg}><Text>💰</Text></View>
          </View>
          <Text style={styles.cardValue}>{formatCurrency(analytics.omsetToday)}</Text>
        </View>

        {/* Card Piutang */}
        <View style={[styles.card, { borderColor: '#F59E0B20', backgroundColor: '#FFFBEB' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Piutang Berjalan</Text>
            <View style={styles.cardIconBg}><Text>⚠️</Text></View>
          </View>
          <Text style={[styles.cardValue, { color: '#D97706' }]}>{formatCurrency(analytics.piutangBerjalan)}</Text>
        </View>

        {/* Card Total Order */}
        <View style={[styles.card, { borderColor: '#3B82F620', backgroundColor: '#EFF6FF' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Order Masuk Hari Ini</Text>
            <View style={styles.cardIconBg}><Text>🧺</Text></View>
          </View>
          <Text style={styles.cardValue}>{analytics.ordersTodayCount} <Text style={styles.cardUnit}>Order</Text></Text>
        </View>

        {/* Card Omset Total */}
        <View style={[styles.card, { borderColor: '#10B98120', backgroundColor: '#F0FDF4' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Total Omset</Text>
            <View style={styles.cardIconBg}><Text>💎</Text></View>
          </View>
          <Text style={[styles.cardValue, { color: '#059669' }]}>{formatCurrency(analytics.omsetTotal)}</Text>
        </View>
      </View>

      {/* 2. GRAPH SVG */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TREN VOLUME PRODUKSI (7 HARI)</Text>
        <Text style={styles.sectionSubtitle}>Akumulasi berat pakaian masuk berskala Kilogram (KG)</Text>
        
        <View style={styles.chartContainer}>
          <Svg width="100%" height="200" viewBox="0 0 500 200">
            <Defs>
              <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                <Stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
              </LinearGradient>
            </Defs>
            
            <Line x1="10" y1="30" x2="490" y2="30" stroke="rgba(15,23,42,0.05)" strokeWidth="1" />
            <Line x1="10" y1="90" x2="490" y2="90" stroke="rgba(15,23,42,0.05)" strokeWidth="1" />
            <Line x1="10" y1="150" x2="490" y2="150" stroke="rgba(15,23,42,0.1)" strokeWidth="1.5" />

            {analytics.chartData.map((data, index) => {
              // Menghitung posisi dan tinggi
              const spacing = 500 / analytics.chartData.length;
              const x = 20 + index * spacing;
              const height = maxVolume > 0 ? (data.volume / maxVolume) * 110 : 0;
              const y = 150 - height;
              const isToday = index === analytics.chartData.length - 1;

              return (
                <G key={data.rawDate}>
                  <Rect
                    x={x}
                    y={y}
                    width="35"
                    height={height}
                    rx="5"
                    fill="url(#barGradient)"
                    stroke={isToday ? "#10b981" : "transparent"}
                    strokeWidth="1.5"
                  />
                  <SvgText
                    x={x + 17.5}
                    y={y - 10}
                    fill="#059669"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {data.volume.toFixed(1)}kg
                  </SvgText>
                  <SvgText
                    x={x + 17.5}
                    y="170"
                    fill={isToday ? "#059669" : "#64748b"}
                    fontSize="11"
                    fontWeight={isToday ? "bold" : "normal"}
                    textAnchor="middle"
                  >
                    {data.date}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>
      </View>

      {/* 3. UNPAID ALERT SYSTEM */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#D97706' }]}>⚠️ UNPAID ALERT SYSTEM</Text>
        <Text style={styles.sectionSubtitle}>Pakaian selesai di rak yang belum dilunasi</Text>
        
        {analytics.unpaidAlerts.length === 0 ? (
          <View style={styles.emptyAlert}>
            <Text style={styles.emptyAlertText}>Tidak ada pakaian menumpuk dengan tunggakan.</Text>
          </View>
        ) : (
          analytics.unpaidAlerts.map((ord) => (
            <View key={ord.id} style={styles.alertCard}>
              <View style={styles.alertInfoRow}>
                <View style={styles.alertAvatar}>
                  <Text style={styles.alertAvatarText}>{ord.customer.name[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertName}>{ord.customer.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={styles.alertInvoice}>{ord.invoiceNumber}</Text>
                    <Text style={styles.alertDot}> • </Text>
                    <Text style={styles.alertTime}>{getDaysAgo(ord.createdAt)}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.alertActionRow}>
                <Text style={styles.alertPrice}>{formatCurrency(ord.totalPrice)}</Text>
                <TouchableOpacity 
                  style={styles.remindBtn}
                  onPress={() => handleSendReminder(ord.id)}
                  disabled={remindLoading === ord.id}
                >
                  {remindLoading === ord.id ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="logo-whatsapp" size={14} color="#FFF" />
                      <Text style={styles.remindBtnText}>Ingatkan WA</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 4. LOW STOCK ALERTS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>🚨 LOW STOCK ALERTS</Text>
        <Text style={styles.sectionSubtitle}>Barang operasional bersisa 5 atau kurang.</Text>
        
        {analytics.lowStockAlerts.length === 0 ? (
          <View style={styles.emptyAlert}>
            <Text style={styles.emptyAlertText}>Aman. Tidak ada stok bahan baku yang menipis.</Text>
          </View>
        ) : (
          analytics.lowStockAlerts.map((item) => (
            <View key={item.id} style={styles.stockCard}>
              <View>
                <Text style={styles.stockName}>{item.name}</Text>
                <Text style={styles.stockBranch}>CABANG: {item.branch.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.stockLabel}>SISA</Text>
                <Text style={styles.stockValue}>{item.stock.toFixed(1)} <Text style={styles.stockUnit}>{item.unit}</Text></Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  retryBtn: {
    marginTop: 15,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  card: {
    width: '46%',
    margin: '2%',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    flex: 1,
  },
  cardIconBg: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  cardUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#94A3B8',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 15,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  emptyAlert: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyAlertText: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  alertCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  alertInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  alertAvatarText: {
    fontWeight: '900',
    color: '#475569',
    fontSize: 14,
  },
  alertName: {
    fontWeight: '900',
    color: '#1E293B',
    fontSize: 14,
  },
  alertInvoice: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  alertDot: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  alertTime: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D97706',
  },
  alertActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  alertPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#D97706',
    fontFamily: 'monospace',
  },
  remindBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  remindBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
    marginLeft: 5,
  },
  stockCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stockName: {
    fontWeight: 'bold',
    color: '#1E293B',
    fontSize: 14,
  },
  stockBranch: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 2,
  },
  stockLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#F87171',
    marginBottom: 2,
  },
  stockValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
    fontFamily: 'monospace',
  },
  stockUnit: {
    fontSize: 10,
    color: '#EF4444',
  },
});
