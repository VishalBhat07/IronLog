import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { authApi, workoutApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [workouts, setWorkouts] = useState<any[]>([]);

    // Form Stats
    const [bio, setBio] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('Prefer not to say');
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            const data = await authApi.getMe();
            setProfile(data);
            setBio(data.bio || '');
            setHeight(data.height?.toString() || '');
            setWeight(data.weight?.toString() || '');
            setGender(data.gender || 'Prefer not to say');
            setProfileImage(data.profileImage || null);

            // Fetch workouts for streak calculation
            const history = await workoutApi.getHistory(100);
            if (history.success) {
                setWorkouts(history.workouts);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate highest streak ever
    const calculateHighestStreak = () => {
        if (workouts.length === 0) return 0;
        
        const sortedWorkouts = [...workouts].sort((a, b) => 
            new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime()
        );
        
        const workoutDates = [...new Set(
            sortedWorkouts.map(w => new Date(w.endedAt).toISOString().split('T')[0])
        )].sort();
        
        if (workoutDates.length === 0) return 0;
        
        let highestStreak = 1;
        let currentStreak = 1;
        
        for (let i = 1; i < workoutDates.length; i++) {
            const prevDate = new Date(workoutDates[i - 1]);
            const currDate = new Date(workoutDates[i]);
            const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
            
            if (diffDays === 1) {
                currentStreak++;
                highestStreak = Math.max(highestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
        
        return highestStreak;
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
            base64: true,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            if (asset.base64) {
                const imageUri = `data:image/jpeg;base64,${asset.base64}`;
                setProfileImage(imageUri);
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await authApi.updateProfile({
                bio,
                height: height ? parseFloat(height) : undefined,
                weight: weight ? parseFloat(weight) : undefined,
                gender,
                profileImage
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
                            setWorkouts([]);
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

    const highestStreak = calculateHighestStreak();
    const totalWorkouts = workouts.length;

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
            
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
                <Text className="text-white text-lg font-bold">My Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                    {saving ? <ActivityIndicator size="small" color="#3b82f6" /> : <Text className="text-primary font-bold text-xs uppercase">Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                
                {/* Profile Picture Section */}
                <View className="items-center mb-6">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        <View className="w-24 h-24 rounded-full bg-card-dark border-2 border-primary/20 items-center justify-center overflow-hidden">
                             {profileImage ? (
                                 <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
                             ) : (
                                 <Text className="text-white text-3xl font-black">{profile?.name?.charAt(0) || 'U'}</Text>
                             )}
                        </View>
                        <View className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-charcoal">
                            <MaterialIcons name="camera-alt" size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-black mt-4">{profile?.name}</Text>
                    <Text className="text-gray-500 text-sm">{profile?.email}</Text>
                </View>

                {/* Stats Cards */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-primary/10 border border-primary/20 rounded-2xl p-4 items-center justify-center">
                        <MaterialIcons name="fitness-center" size={24} color="#3b82f6" />
                        <Text className="text-2xl font-black text-white mt-2 text-center">{totalWorkouts}</Text>
                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider text-center">Total Workouts</Text>
                    </View>
                    <View className="flex-1 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 items-center">
                        <MaterialIcons name="local-fire-department" size={24} color="#f97316" />
                        <Text className="text-2xl font-black text-white mt-2">{highestStreak}</Text>
                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Best Streak</Text>
                    </View>
                    <View className="flex-1 bg-field-dark/50 border border-white/5 rounded-2xl p-4 items-center">
                        <MaterialIcons name="scale" size={24} color="#3b82f6" />
                        <Text className="text-2xl font-black text-white mt-2">{weight || '--'}</Text>
                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Weight (kg)</Text>
                    </View>
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

                    <TouchableOpacity onPress={async () => {
                        try {
                            await authApi.seedWeights();
                            Alert.alert('Success', 'Legacy weight data imported!');
                            fetchData(); // refresh
                        } catch(e) { Alert.alert('Error', 'Failed to import data'); }
                    }} className="flex-row items-center justify-between p-4 border-t border-white/5 active:bg-blue-500/10">
                         <View className="flex-row items-center gap-3">
                             <MaterialIcons name="cloud-download" size={20} color="#3b82f6" />
                             <Text className="text-primary font-bold">Import Legacy Data</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                </View>

                 <Text className="text-center text-gray-600 text-xs">IronLog v1.0.0</Text>

            </ScrollView>
        </SafeAreaView>
    );
}
