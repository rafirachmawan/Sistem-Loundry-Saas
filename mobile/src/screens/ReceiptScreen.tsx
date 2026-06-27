import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput, ScrollView, Switch 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReceiptScreen() {
  const [loading, setLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState<string>("trial");
  const [tenantId, setTenantId] = useState<string | null>(null);
  
  // Settings State
  const [headerText, setHeaderText] = useState("Terima kasih telah mencuci di Spindo!");
  const [footerText, setFooterText] = useState("Barang yang tidak diambil lebih dari 1 bulan bukan tanggung jawab kami.");
  const [useCustomLogo, setUseCustomLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          
          let currentPlan = "trial";
          if (parsed.tenantTier) {
            currentPlan = parsed.tenantTier === "STARTER" ? "trial" : parsed.tenantTier.toLowerCase();
          } else if (parsed.email === "prolaundry@gmail.com" || parsed.name?.toLowerCase() === "pro") {
            currentPlan = "pro";
          }
          
          // Note: In reality, subscription data might come from API or AsyncStorage
          setActivePlanId(currentPlan);
          setTenantId(parsed.tenantId);

          if (currentPlan !== "enterprise" && currentPlan !== "pro") {
            setHeaderText("Terima kasih telah mencuci di Spindo!");
            setFooterText("Barang yang tidak diambil lebih dari 1 bulan bukan tanggung jawab kami. Cek riwayat laundry Anda melalui aplikasi Spindo.");
          } else if (parsed.tenantId) {
            const savedSettings = await AsyncStorage.getItem(`receiptSettings_${parsed.tenantId}`);
            if (savedSettings) {
              const settings = JSON.parse(savedSettings);
              setHeaderText(settings.headerText || "Terima kasih telah mencuci di Spindo!");
              setFooterText(settings.footerText || "Barang yang tidak diambil lebih dari 1 bulan bukan tanggung jawab kami.");
              setUseCustomLogo(settings.useCustomLogo || false);
            } else {
              setHeaderText("Terima kasih telah mencuci di Spindo!");
              setFooterText("Barang yang tidak diambil lebih dari 1 bulan bukan tanggung jawab kami.");
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (tenantId) {
        await AsyncStorage.setItem(`receiptSettings_${tenantId}`, JSON.stringify({
          headerText,
          footerText,
          useCustomLogo
        }));
      }
      
      // Simulate API Call delay
      setTimeout(() => {
        setIsSaving(false);
        Alert.alert("Sukses", "Pengaturan struk WhatsApp berhasil disimpan!");
      }, 500);
    } catch (err) {
      setIsSaving(false);
      Alert.alert("Error", "Gagal menyimpan pengaturan struk.");
    }
  };

  const isEnterprise = activePlanId === "enterprise";
  const canCustomizeText = activePlanId === "enterprise" || activePlanId === "pro";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={{ marginTop: 10, color: '#64748B', fontWeight: 'bold' }}>Memuat pengaturan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Customasi Struk</Text>
          <Text style={styles.headerSubtitle}>Atur format nota WhatsApp pelanggan</Text>
        </View>
        <View style={[styles.planBadge, isEnterprise ? styles.planEnterprise : styles.planPro]}>
          <Text style={[styles.planBadgeText, isEnterprise ? styles.planEnterpriseText : styles.planProText]}>
            {activePlanId === "pro" ? "PRO PLAN" : (isEnterprise ? "ENTERPRISE" : "STARTER")}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>
        
        {!canCustomizeText && (
          <View style={styles.alertBox}>
            <Text style={{ fontSize: 20 }}>ℹ️</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.alertTitle}>Template Struk Paten</Text>
              <Text style={styles.alertText}>
                Struk WhatsApp akan menggunakan template standar. Upgrade ke Pro atau Enterprise untuk mengkustomisasi teks.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.iconBox}>
            <Ionicons name="document-text" size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Pengaturan Teks</Text>
            <Text style={styles.sectionSubtitle}>Sesuaikan pesan struk WA Anda</Text>
          </View>
        </View>

        {/* Header Text */}
        <View style={[styles.card, !canCustomizeText && styles.cardDisabled]}>
          <Text style={[styles.inputLabel, !canCustomizeText && styles.textDisabled]}>Pesan Pembuka (Header)</Text>
          <Text style={[styles.inputHelp, !canCustomizeText && styles.textDisabled]}>Pesan sapaan ini muncul di bagian atas nota WhatsApp.</Text>
          
          <TextInput
            style={[styles.input, !canCustomizeText && styles.inputDisabled]}
            value={headerText}
            onChangeText={setHeaderText}
            multiline
            numberOfLines={3}
            editable={canCustomizeText}
            placeholder="Contoh: Halo Kak, terima kasih sudah laundry..."
          />
        </View>

        {/* Footer Text */}
        <View style={[styles.card, !canCustomizeText && styles.cardDisabled]}>
          <Text style={[styles.inputLabel, !canCustomizeText && styles.textDisabled]}>Pesan Penutup (Footer)</Text>
          <Text style={[styles.inputHelp, !canCustomizeText && styles.textDisabled]}>Pesan informasi, S&K, atau promo di bagian bawah.</Text>
          
          <TextInput
            style={[styles.input, !canCustomizeText && styles.inputDisabled]}
            value={footerText}
            onChangeText={setFooterText}
            multiline
            numberOfLines={3}
            editable={canCustomizeText}
            placeholder="Syarat & ketentuan, jam buka toko, dsb..."
          />
        </View>

        {/* Logo Customization (Enterprise) */}
        <View style={[styles.card, !isEnterprise && styles.cardDisabled]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.inputLabel, !isEnterprise && styles.textDisabled]}>Gunakan Logo Toko Sendiri</Text>
              <Text style={[styles.inputHelp, !isEnterprise && styles.textDisabled]}>
                Tampilkan logo bisnis Anda di header pesan WA (Khusus Enterprise).
              </Text>
            </View>
            <Switch
              value={useCustomLogo}
              onValueChange={setUseCustomLogo}
              disabled={!isEnterprise}
              trackColor={{ false: '#CBD5E1', true: '#9333EA' }}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, !canCustomizeText && styles.submitBtnDisabled]} 
          onPress={handleSave} 
          disabled={!canCustomizeText || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>{!canCustomizeText ? "Terkunci" : "Simpan Pengaturan"}</Text>
          )}
        </TouchableOpacity>

        {/* Preview Section */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>PREVIEW PESAN WHATSAPP</Text>
          
          <View style={styles.mockupPhone}>
            <View style={styles.mockupHeader}>
              <Ionicons name="arrow-back" size={16} color="#FFF" />
              <View style={styles.mockupAvatar}>
                <Ionicons name="person" size={12} color="#FFF" />
              </View>
              <View>
                <Text style={styles.mockupName}>Spindo</Text>
                <Text style={styles.mockupRole}>Akun Bisnis</Text>
              </View>
            </View>

            <View style={styles.mockupBody}>
              <View style={styles.mockupDate}>
                <Text style={styles.mockupDateText}>Hari Ini</Text>
              </View>
              
              <View style={styles.chatBubble}>
                <View style={styles.chatBubbleTriangle} />
                <View style={styles.chatContent}>
                  {useCustomLogo && isEnterprise ? (
                    <Text style={styles.receiptTitle}>[LOGO TOKO ANDA]</Text>
                  ) : (
                    <Text style={styles.receiptTitle}>=== NOTA LAUNDRY ===</Text>
                  )}
                  
                  <Text style={styles.receiptText}>{headerText || "..."}</Text>
                  
                  <View style={styles.receiptDivider}>
                    <Text style={styles.receiptHint}>(Rincian Transaksi & Harga)</Text>
                  </View>
                  
                  <Text style={[styles.receiptText, { fontStyle: 'italic' }]}>{footerText || "..."}</Text>
                </View>
                <Text style={styles.chatTime}>10:45 AM</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  planPro: { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
  planProText: { color: '#2563EB', fontWeight: '900', fontSize: 10 },
  planEnterprise: { backgroundColor: '#FAF5FF', borderColor: '#F3E8FF' },
  planEnterpriseText: { color: '#9333EA', fontWeight: '900', fontSize: 10 },

  alertBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#DBEAFE', marginBottom: 20 },
  alertTitle: { fontSize: 12, fontWeight: '900', color: '#1E3A8A' },
  alertText: { fontSize: 11, color: '#1D4ED8', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 36, height: 36, backgroundColor: '#DBEAFE', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  sectionSubtitle: { fontSize: 11, color: '#64748B' },

  card: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  cardDisabled: { backgroundColor: '#F8FAFC' },
  textDisabled: { color: '#94A3B8' },
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
  inputHelp: { fontSize: 11, color: '#64748B', marginBottom: 10 },
  
  input: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 13, color: '#1E293B', textAlignVertical: 'top' },
  inputDisabled: { color: '#94A3B8', backgroundColor: '#F8FAFC' },

  submitBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  submitBtnDisabled: { backgroundColor: '#CBD5E1' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  previewContainer: { marginTop: 30, alignItems: 'center' },
  previewTitle: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginBottom: 15 },
  
  mockupPhone: { width: 280, height: 450, backgroundColor: '#075E54', borderRadius: 30, borderWidth: 8, borderColor: '#1E293B', overflow: 'hidden' },
  mockupHeader: { backgroundColor: '#075E54', paddingHorizontal: 15, paddingTop: 20, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  mockupAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 },
  mockupName: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  mockupRole: { color: 'rgba(255,255,255,0.8)', fontSize: 9 },
  
  mockupBody: { flex: 1, backgroundColor: '#efeae2', padding: 15 },
  mockupDate: { alignSelf: 'center', backgroundColor: '#e1f3fb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 15 },
  mockupDateText: { fontSize: 10, color: '#54656f' },
  
  chatBubble: { backgroundColor: '#FFF', padding: 10, borderRadius: 10, borderTopLeftRadius: 0, maxWidth: '95%', alignSelf: 'flex-start', position: 'relative' },
  chatBubbleTriangle: { position: 'absolute', left: -8, top: 0, width: 0, height: 0, borderTopWidth: 10, borderRightWidth: 10, borderTopColor: '#FFF', borderRightColor: 'transparent' },
  chatContent: { marginBottom: 5 },
  receiptTitle: { textAlign: 'center', fontWeight: 'bold', fontSize: 11, color: '#111b21', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', borderStyle: 'dashed', paddingBottom: 5, marginBottom: 5 },
  receiptText: { fontSize: 10, color: '#111b21', fontFamily: 'monospace' },
  receiptDivider: { paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', marginVertical: 5, alignItems: 'center' },
  receiptHint: { fontSize: 9, color: '#94A3B8', fontStyle: 'italic' },
  chatTime: { fontSize: 9, color: '#94A3B8', alignSelf: 'flex-end' },
});
