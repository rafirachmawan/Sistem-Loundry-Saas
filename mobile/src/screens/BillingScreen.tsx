import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

export default function BillingScreen() {
  const [user, setUser] = useState<any>(null);
  const [subStatus, setSubStatus] = useState<"TRIAL" | "ACTIVE">("TRIAL");
  const [activePlanId, setActivePlanId] = useState<string>("trial");
  const [expiryDate, setExpiryDate] = useState<Date>(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Modal & Loading States
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "VA">("QRIS");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);

          if (parsed.tenantTier) {
            const isStarter = parsed.tenantTier === "STARTER";
            setActivePlanId(isStarter ? "trial" : parsed.tenantTier.toLowerCase());
            setSubStatus(isStarter ? "TRIAL" : "ACTIVE");
            
            let expiredAt = new Date(Date.now() + (isStarter ? 7 : 30) * 24 * 60 * 60 * 1000);
            if (parsed.tenantCreatedAt) {
              const createdAt = new Date(parsed.tenantCreatedAt);
              expiredAt = isStarter
                ? new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
                : new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
            }
            setExpiryDate(expiredAt);
          } else if (parsed.email === "prolaundry@gmail.com" || parsed.name?.toLowerCase() === "pro") {
            setActivePlanId("pro");
            setSubStatus("ACTIVE");
            setExpiryDate(new Date("2026-07-17T10:00:00"));
          }

          const savedSub = await AsyncStorage.getItem(`sub_${parsed.email}`);
          if (savedSub) {
            const sub = JSON.parse(savedSub);
            setActivePlanId(sub.planId);
            setSubStatus(sub.status);
            setExpiryDate(new Date(sub.expiryDate));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadBillingData();
  }, []);

  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const plans: Plan[] = [
    {
      id: "trial",
      name: "Paket Uji Coba (Free Trial)",
      price: 0,
      period: "7 Hari",
      features: [
        "✓ 1 Outlet Cabang",
        "✓ 1 Kasir per Outlet",
        "✓ Max 3 Master Layanan",
        "✗ Uang Masuk & Keluar",
        "✗ Struk WA",
        "✓ Support 24/7",
      ],
    },
    {
      id: "pro",
      name: "Paket Pro Bulanan",
      price: 49000,
      period: "Bulan",
      popular: true,
      features: [
        "✓ Max 2 Outlet Cabang",
        "✓ 1 Kasir per Outlet",
        "✓ Max 10 Master Layanan",
        "✓ Uang Masuk & Keluar",
        "✓ Struk WA Standar",
        "✓ Support 24/7",
      ],
    },
    {
      id: "enterprise",
      name: "Paket Enterprise Bulanan",
      price: 149000,
      period: "Bulan",
      features: [
        "✓ Outlet Cabang Unl.",
        "✓ User Kasir Unl.",
        "✓ Master Layanan Unl.",
        "✓ Uang Masuk & Keluar",
        "✓ Struk WA Custom Logo",
        "✓ Support Prioritas",
      ],
    },
  ];

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === "trial") return;
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleSimulatePayment = () => {
    setConfirming(true);
    setTimeout(async () => {
      setConfirming(false);
      setSubStatus("ACTIVE");
      if (selectedPlan && user) {
        setActivePlanId(selectedPlan.id);
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 30);
        setExpiryDate(newExpiry);

        await AsyncStorage.setItem(`sub_${user.email}`, JSON.stringify({
          planId: selectedPlan.id,
          status: "ACTIVE",
          expiryDate: newExpiry.toISOString(),
        }));
      }
      setShowModal(false);
      Alert.alert("Berhasil!", `Langganan Anda diperbarui ke "${selectedPlan?.name}"`);
    }, 1500);
  };

  const formatCurrency = (num: number) => {
    if (num === 0) return "Gratis";
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const activePlanDetails = plans.find((p) => p.id === activePlanId) || plans[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Billing & Langganan</Text>
          <Text style={styles.headerSubtitle}>Kelola langganan bulanan outlet Anda</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Portal</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>
        
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <View style={[styles.statusDot, subStatus === 'ACTIVE' ? styles.statusDotActive : styles.statusDotTrial]} />
                <Text style={styles.statusLabel}>Status Akun</Text>
              </View>
              <Text style={styles.planName}>{activePlanDetails.name}</Text>
              <Text style={styles.userEmail}>{user?.email || "owner@spindo.com"}</Text>
            </View>
          </View>
          
          <View style={styles.expiryBox}>
            <Text style={styles.expiryLabel}>Masa Berlaku Aktif</Text>
            <Text style={[styles.expiryDays, subStatus === 'ACTIVE' ? { color: '#059669' } : { color: '#D97706' }]}>
              Sisa {daysRemaining} Hari
            </Text>
            <Text style={styles.expiryDate}>Hingga: {expiryDate.toLocaleDateString("id-ID")}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Pilih Paket Langganan Outlet</Text>

        {/* Plans Grid */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === activePlanId;
            return (
              <View key={plan.id} style={[styles.planCard, isCurrentPlan && styles.planCardActive, plan.popular && styles.planCardPopular]}>
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>TERPOPULER</Text>
                  </View>
                )}
                {isCurrentPlan && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>AKTIF SAAT INI</Text>
                  </View>
                )}
                
                <Text style={styles.planCardTitle}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.planPrice}>{formatCurrency(plan.price)}</Text>
                  {plan.price > 0 && <Text style={styles.planPeriod}>/ {plan.period}</Text>}
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((feat, idx) => {
                    const isExcluded = feat.startsWith("✗");
                    return (
                      <View key={idx} style={styles.featureItem}>
                        <Text style={[styles.featureIcon, isExcluded ? { color: '#CBD5E1' } : { color: '#10B981' }]}>
                          {isExcluded ? "✗" : "✓"}
                        </Text>
                        <Text style={[styles.featureText, isExcluded && { color: '#94A3B8', textDecorationLine: 'line-through' }]}>
                          {feat.substring(2)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity 
                  style={[styles.planBtn, isCurrentPlan || plan.id === 'trial' ? styles.planBtnDisabled : styles.planBtnActive]}
                  disabled={isCurrentPlan || plan.id === 'trial'}
                  onPress={() => handleSelectPlan(plan)}
                >
                  <Text style={[styles.planBtnText, isCurrentPlan || plan.id === 'trial' ? { color: '#94A3B8' } : { color: '#FFF' }]}>
                    {isCurrentPlan ? "Paket Aktif" : plan.id === "trial" ? "Sudah Digunakan" : "Pilih & Bayar"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* Payment Simulation Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Simulasi Pembayaran</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryBox}>
              <View>
                <Text style={styles.summaryLabel}>Paket Dipilih</Text>
                <Text style={styles.summaryValue}>{selectedPlan?.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.summaryLabel}>Total Pembayaran</Text>
                <Text style={styles.summaryPrice}>{selectedPlan ? formatCurrency(selectedPlan.price) : '0'}</Text>
              </View>
            </View>

            <View style={styles.methodSelector}>
              <TouchableOpacity 
                style={[styles.methodBtn, paymentMethod === 'QRIS' && styles.methodBtnActive]}
                onPress={() => setPaymentMethod('QRIS')}
              >
                <Text style={[styles.methodBtnText, paymentMethod === 'QRIS' && styles.methodBtnTextActive]}>Scan QRIS</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodBtn, paymentMethod === 'VA' && styles.methodBtnActive]}
                onPress={() => setPaymentMethod('VA')}
              >
                <Text style={[styles.methodBtnText, paymentMethod === 'VA' && styles.methodBtnTextActive]}>Virtual Account</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentGraphic}>
              {paymentMethod === 'QRIS' ? (
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.qrisBox}>
                    <Text style={{ fontSize: 10, fontWeight: '900', marginBottom: 5 }}>QRIS MOCK</Text>
                    <View style={styles.qrisGrid}>
                      <View style={[styles.qrisDot, { backgroundColor: '#1E293B' }]} />
                      <View style={[styles.qrisDot, { backgroundColor: '#334155' }]} />
                      <View style={[styles.qrisDot, { backgroundColor: '#475569' }]} />
                      <View style={[styles.qrisDot, { backgroundColor: '#1E293B' }]} />
                    </View>
                  </View>
                  <Text style={styles.paymentHint}>Silakan scan kode QRIS di atas dengan aplikasi m-banking atau e-wallet Anda.</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.summaryLabel}>Nomor Rekening VA (BCA)</Text>
                  <View style={styles.vaRow}>
                    <Text style={styles.vaNumber}>88019 28392 8172</Text>
                    <TouchableOpacity style={styles.copyBtn} onPress={() => Alert.alert("Salin", "Nomor rekening berhasil disalin!")}>
                      <Text style={styles.copyBtnText}>Salin</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.paymentHint}>Gunakan menu Transfer Virtual Account pada mobile banking BCA Anda.</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.payBtn} onPress={handleSimulatePayment} disabled={confirming}>
              {confirming ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payBtnText}>Saya Sudah Transfer</Text>}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  headerBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#DBEAFE' },
  headerBadgeText: { color: '#2563EB', fontWeight: '900', fontSize: 10, textTransform: 'uppercase' },

  statusCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#E2E8F0' },
  statusRow: { marginBottom: 15 },
  statusDot: { w: 8, h: 8, borderRadius: 4, marginRight: 6, width: 8, height: 8 },
  statusDotTrial: { backgroundColor: '#F59E0B' },
  statusDotActive: { backgroundColor: '#10B981' },
  statusLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 },
  planName: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginTop: 5 },
  userEmail: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '600' },
  
  expiryBox: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  expiryLabel: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  expiryDays: { fontSize: 22, fontWeight: '900', fontFamily: 'monospace' },
  expiryDate: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginTop: 4 },

  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#64748B', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 0.5 },
  plansContainer: { gap: 15 },
  
  planCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', position: 'relative', overflow: 'hidden' },
  planCardActive: { borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.03)' },
  planCardPopular: { borderColor: '#3B82F6' },
  
  popularBadge: { position: 'absolute', top: 15, right: -25, backgroundColor: '#3B82F6', paddingVertical: 4, paddingHorizontal: 25, transform: [{ rotate: '45deg' }] },
  popularBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  activeBadge: { position: 'absolute', top: 15, right: -25, backgroundColor: '#10B981', paddingVertical: 4, paddingHorizontal: 25, transform: [{ rotate: '45deg' }] },
  activeBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  planCardTitle: { fontSize: 12, fontWeight: '900', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8, marginBottom: 15 },
  planPrice: { fontSize: 24, fontWeight: '900', color: '#0F172A', fontFamily: 'monospace' },
  planPeriod: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold', marginLeft: 4 },

  featuresList: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15, marginBottom: 15 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureIcon: { fontSize: 14, fontWeight: '900', marginRight: 8, width: 16, textAlign: 'center' },
  featureText: { fontSize: 12, fontWeight: '600', color: '#334155' },

  planBtn: { padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  planBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  planBtnDisabled: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  planBtnText: { fontSize: 12, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  
  summaryBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
  summaryLabel: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  summaryValue: { fontSize: 14, fontWeight: '900', color: '#1E293B' },
  summaryPrice: { fontSize: 16, fontWeight: '900', color: '#2563EB', fontFamily: 'monospace' },

  methodSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  methodBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#FFF' },
  methodBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  methodBtnText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  methodBtnTextActive: { color: '#1D4ED8' },

  paymentGraphic: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', marginBottom: 20, minHeight: 180, justifyContent: 'center' },
  qrisBox: { width: 120, height: 120, borderWidth: 4, borderColor: '#1E293B', borderRadius: 12, padding: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', marginBottom: 15 },
  qrisGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 80, height: 80, justifyContent: 'space-between', alignContent: 'space-between' },
  qrisDot: { width: 35, height: 35, borderRadius: 6 },
  paymentHint: { fontSize: 10, color: '#64748B', textAlign: 'center', lineHeight: 16, paddingHorizontal: 20 },
  
  vaRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  vaNumber: { fontSize: 18, fontWeight: '900', fontFamily: 'monospace', color: '#1E293B', marginRight: 15, letterSpacing: 2 },
  copyBtn: { backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  copyBtnText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },

  payBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center' },
  payBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
