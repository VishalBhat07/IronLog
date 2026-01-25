import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { authApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Stats
    const [bio, setBio] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('Prefer not to say');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authApi.getMe();
                setProfile(data);
                setBio(data.bio || '');
                setHeight(data.height?.toString() || '');
                setWeight(data.weight?.toString() || '');
                setGender(data.gender || 'Prefer not to say');
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await authApi.updateProfile({
                bio,
                height: height ? parseFloat(height) : undefined,
                weight: weight ? parseFloat(weight) : undefined,
                gender
            });
            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            "Clear Data",
            "This will permanently delete all your workout logs. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Clear All Data", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await authApi.clearData();
                            Alert.alert("Data Cleared");
                        } catch(e) { Alert.alert("Error deleting data"); }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure? This will delete your account and all data permanently.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete Forever", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await authApi.deleteAccount();
                            signOut();
                        } catch(e) { Alert.alert("Error deleting account"); }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-charcoal items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    if (!profile) {
        return (
             <SafeAreaView className="flex-1 bg-charcoal items-center justify-center p-6">
                <Text className="text-white text-lg font-bold mb-4">Could not load profile.</Text>
                <TouchableOpacity onPress={signOut} className="bg-card-dark px-6 py-3 rounded-xl border border-white/10">
                    <Text className="text-white font-bold">Log Out</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-charcoal">
            <StatusBar style="light" />
            
            {/* Header - No Back Button since it's a Tab */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
                <Text className="text-white text-lg font-bold">My Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                    {saving ? <ActivityIndicator size="small" color="#3b82f6" /> : <Text className="text-primary font-bold text-xs uppercase">Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                
                {/* Profile Picture Section */}
                <View className="items-center mb-8">
                    <TouchableOpacity className="relative">
                        <View className="w-24 h-24 rounded-full bg-card-dark border-2 border-primary/20 items-center justify-center overflow-hidden">
                             <Text className="text-white text-3xl font-black">{profile?.name?.charAt(0) || 'U'}</Text>
                        </View>
                        <View className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-charcoal">
                            <MaterialIcons name="camera-alt" size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-black mt-4">{profile?.name}</Text>
                    <Text className="text-gray-500 text-sm">{profile?.email}</Text>
                </View>

                {/* Form Fields */}
                <View className="gap-4 mb-8">
                    <View>
                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Bio</Text>
                        <TextInput 
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor="#4b5563"
                            multiline
                            className="bg-card-dark text-white rounded-xl p-4 min-h-[80px] border border-white/5"
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Height (cm)</Text>
                            <TextInput 
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="numeric"
                                placeholder="180"
                                placeholderTextColor="#4b5563"
                                className="bg-card-dark text-white rounded-xl p-4 h-12 border border-white/5"
                            />
                        </View>
                        <View className="flex-1">
                             <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Weight (kg)</Text>
                            <TextInput 
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                placeholder="75"
                                placeholderTextColor="#4b5563"
                                className="bg-card-dark text-white rounded-xl p-4 h-12 border border-white/5"
                            />
                        </View>
                    </View>

                     <View>
                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Gender</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                            {['Male', 'Female', 'Other'].map(g => (
                                <TouchableOpacity 
                                    key={g} 
                                    onPress={() => setGender(g)}
                                    className={`px-4 py-2 rounded-lg border ${gender === g ? 'bg-primary border-primary' : 'bg-card-dark border-white/5'}`}
                                >
                                    <Text className={`font-bold ${gender === g ? 'text-white' : 'text-gray-500'}`}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Settings & Danger Zone */}
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 mt-4">Settings</Text>
                
                <View className="bg-card-dark rounded-2xl overflow-hidden border border-white/5 mb-8">
                    <TouchableOpacity onPress={handleClearData} className="flex-row items-center justify-between p-4 border-b border-white/5 active:bg-white/5">
                        <View className="flex-row items-center gap-3">
                             <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                             <Text className="text-red-500 font-bold">Clear All Workout Data</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#4b5563" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => signOut()} className="flex-row items-center justify-between p-4 border-b border-white/5 active:bg-white/5">
                         <View className="flex-row items-center gap-3">
                             <MaterialIcons name="logout" size={20} color="#9ca3af" />
                             <Text className="text-white font-bold">Log Out</Text>
                        </View>
                         <MaterialIcons name="chevron-right" size={20} color="#4b5563" />
                    </TouchableOpacity>

                     <TouchableOpacity onPress={handleDeleteAccount} className="flex-row items-center justify-between p-4 active:bg-red-500/10">
                         <View className="flex-row items-center gap-3">
                             <MaterialIcons name="warning" size={20} color="#ef4444" />
                             <Text className="text-red-500 font-bold">Delete Account</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                 <Text className="text-center text-gray-600 text-xs">IronLog v1.0.0</Text>

            </ScrollView>
        </SafeAreaView>
    );
}
