import React, { useEffect, useState } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import KasirScreen from '../screens/KasirScreen';
import DashboardOwnerScreen from '../screens/DashboardOwnerScreen';

const Drawer = createDrawerNavigator();

// Layar Placeholder untuk fitur yang belum diimplementasi di mobile
function DummyScreen({ route }: any) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{route.name}</Text>
      <Text style={styles.subtitle}>Fitur ini sedang dalam pengembangan versi mobile.</Text>
    </View>
  );
}

function LockedScreen({ route }: any) {
  return (
    <View style={styles.center}>
      <Ionicons name="lock-closed" size={48} color="#94A3B8" />
      <Text style={styles.title}>{route.name}</Text>
      <Text style={styles.subtitle}>Fitur ini hanya tersedia untuk Paket Enterprise.</Text>
      <Text style={styles.subtitleInfo}>Silakan upgrade paket Anda di versi web.</Text>
    </View>
  );
}

// Custom Drawer untuk menampilkan Profil dan Logout (Sesuai Web)
function CustomDrawerContent(props: any) {
  const { user } = props;
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    Alert.alert("Konfirmasi", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Keluar", 
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem('user');
          // Karena fetch di mobile menyimpan cookie auth_token, kita bisa call endpoint logout
          try {
            await fetch('http://10.0.2.2:3000/api/auth'); // Call logout backend
          } catch(e) {}
          navigation.replace('Login');
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.drawerHeader}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandText}>S</Text>
        </View>
        <Text style={styles.brandTitle}>Spindo</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Menu Items Rendered by Navigator */}
        <View style={{ flex: 1, paddingVertical: 10 }}>
          {props.state.routes.map((route: any, index: number) => {
            const focused = props.state.index === index;
            const { options } = props.descriptors[route.key];
            const label = options.title !== undefined ? options.title : route.name;

            return (
              <DrawerItem
                key={route.key}
                label={label}
                icon={options.drawerIcon}
                focused={focused}
                activeTintColor="#2563EB"
                activeBackgroundColor="#EFF6FF"
                inactiveTintColor="#64748B"
                labelStyle={{ fontWeight: 'bold', marginLeft: 0, fontSize: 14 }}
                style={{ marginVertical: 4, borderRadius: 10, paddingHorizontal: 5 }}
                onPress={() => props.navigation.navigate(route.name)}
              />
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* User Profile & Logout Box di Bawah */}
      <View style={styles.drawerFooter}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name ? user.name[0].toUpperCase() : 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{user?.name || 'Loading...'}</Text>
            <Text style={styles.profileRole} numberOfLines={1}>
              {user?.tenantName || 'SaaS Tenant'} ({user?.role})
            </Text>
          </View>
        </View>
        <DrawerItem
          label="Keluar Aplikasi"
          icon={({ color, size }) => <Ionicons name="log-out-outline" size={20} color="#EF4444" />}
          labelStyle={{ fontWeight: 'bold', color: '#EF4444', marginLeft: 0, fontSize: 14 }}
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </View>
    </View>
  );
}

export default function DrawerNavigator() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const saved = await AsyncStorage.getItem('user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const role = user?.role || "KASIR";
  const planId = user?.tenantTier?.toLowerCase() || "trial";
  
  const isOwner = role === "OWNER";
  const isDeveloper = role === "DEVELOPER";
  const isKasir = role === "KASIR";
  const isEnterprise = planId === "enterprise" || planId === "pro" || emailIsPro(user?.email);

  function emailIsPro(email: string) {
    if (!email) return false;
    return email === "prolaundry@gmail.com" || email.startsWith("dev") || email.startsWith("owner");
  }

  return (
    <Drawer.Navigator
      initialRouteName={isDeveloper ? "CPanel Developer" : (isOwner ? "Dashboard Owner" : "Kasir (POS)")}
      drawerContent={(props) => <CustomDrawerContent {...props} user={user} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF', elevation: 1, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
      }}
    >
      {/* 🟢 MENU DEVELOPER */}
      {isDeveloper && (
        <>
          <Drawer.Screen name="CPanel Developer" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="code-slash" size={size} color={color}/> }} />
          <Drawer.Screen name="Kelola Tenants" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="business" size={size} color={color}/> }} />
          <Drawer.Screen name="Kelola Users" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="people" size={size} color={color}/> }} />
          <Drawer.Screen name="Onboard Tenant" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="rocket" size={size} color={color}/> }} />
        </>
      )}

      {/* 🟠 MENU OWNER */}
      {isOwner && (
        <>
          <Drawer.Screen name="Dashboard Owner" component={DashboardOwnerScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="home" size={size} color={color}/> }} />
          <Drawer.Screen name="Kelola Layanan" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="list" size={size} color={color}/> }} />
          <Drawer.Screen 
            name="Kelola Cabang" 
            component={isEnterprise ? DummyScreen : LockedScreen} 
            options={{ drawerIcon: ({color, size}) => <Ionicons name={isEnterprise ? "git-network" : "lock-closed"} size={size} color={color}/> }} 
          />
          <Drawer.Screen name="Kelola Pengguna" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="person-add" size={size} color={color}/> }} />
          <Drawer.Screen name="Customasi Struk" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="document-text" size={size} color={color}/> }} />
          <Drawer.Screen name="Billing & Langganan" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="card" size={size} color={color}/> }} />
        </>
      )}

      {/* 🔵 MENU KASIR / UMUM (Ditampilkan untuk Owner dan Kasir) */}
      {!isDeveloper && (
        <>
          <Drawer.Screen name="Kasir (POS)" component={KasirScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="cart" size={size} color={color}/> }} />
          <Drawer.Screen name="Pelanggan" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="happy" size={size} color={color}/> }} />
          <Drawer.Screen name="Riwayat Transaksi" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="receipt" size={size} color={color}/> }} />
          <Drawer.Screen name="Visual Tracker" component={DummyScreen} options={{ drawerIcon: ({color, size}) => <Ionicons name="analytics" size={size} color={color}/> }} />
          <Drawer.Screen 
            name="Stok Gudang" 
            component={isEnterprise ? DummyScreen : LockedScreen} 
            options={{ drawerIcon: ({color, size}) => <Ionicons name={isEnterprise ? "cube" : "lock-closed"} size={size} color={color}/> }} 
          />
        </>
      )}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: 20 },
  title: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  subtitleInfo: { fontSize: 12, color: '#F59E0B', textAlign: 'center', marginTop: 10, fontWeight: 'bold' },
  
  // Custom Drawer Styles
  drawerHeader: { padding: 20, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center' },
  brandIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  brandText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  
  drawerFooter: { borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#F8FAFC', padding: 20, paddingBottom: 25 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  avatarText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  profileRole: { fontSize: 12, color: '#64748B', marginTop: 2 },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 12, marginTop: 5, marginHorizontal: 0 },
});
