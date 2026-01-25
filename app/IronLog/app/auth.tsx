import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
// import { useRouter } from 'expo-router'; // Handled by Context
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Use Auth hook
    const { signIn, signUp } = useAuth();

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!isLogin && !name) {
             Alert.alert('Error', 'Please enter your name');
             return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(name, email, password);
            }
        } catch (error: any) {
            console.error('Auth Error Details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            const msg = error.response?.data?.message || 'Authentication failed. Check console.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-charcoal">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pb-8">
                    
                    {/* Header Section */}
                    <View className="items-center pt-10 pb-4">
                        <Image 
                            source={require('../assets/images/logo.png')} 
                            className="w-48 h-48" 
                            resizeMode="contain" 
                        />
                    </View>

                    {/* Toggle Switch */}
                    <View className="flex-row h-12 bg-black/40 rounded-2xl p-1.5 border border-white/5 mb-8">
                        <TouchableOpacity 
                            onPress={() => setIsLogin(true)}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: isLogin ? '#1f232c' : 'transparent' }}
                        >
                            <Text className={`text-sm font-bold ${isLogin ? 'text-white' : 'text-gray-500'}`}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setIsLogin(false)}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: !isLogin ? '#1f232c' : 'transparent' }}
                        >
                            <Text className={`text-sm font-bold ${!isLogin ? 'text-white' : 'text-gray-500'}`}>Register</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View className="gap-4">
                        {!isLogin && (
                            <View>
                                <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Full Name</Text>
                                <TextInput
                                    className="w-full bg-field-dark text-white rounded-xl h-14 px-4 border border-white/10 focus:border-primary text-base"
                                    placeholder="John Doe"
                                    placeholderTextColor="#525252"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}

                        <View>
                            <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Email Address</Text>
                            <TextInput
                                className="w-full bg-field-dark text-white rounded-xl h-14 px-4 border border-white/10 focus:border-primary text-base"
                                placeholder="name@example.com"
                                placeholderTextColor="#525252"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View>
                            <Text className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Password</Text>
                            <View className="w-full bg-field-dark rounded-xl h-14 px-4 border border-white/10 focus:border-primary flex-row items-center">
                                <TextInput
                                    className="flex-1 text-white text-base h-full"
                                    placeholder="Enter your password"
                                    placeholderTextColor="#525252"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {isLogin && (
                        <TouchableOpacity className="items-end mt-3">
                            <Text className="text-primary text-xs font-bold tracking-wide">FORGOT PASSWORD?</Text>
                        </TouchableOpacity>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity 
                        onPress={handleAuth}
                        activeOpacity={0.8}
                        className="w-full bg-primary mt-8 h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-black uppercase tracking-wider">
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Social Login Divider */}
                    <View className="flex-row items-center my-10">
                        <View className="flex-1 h-[1px] bg-white/5" />
                        <Text className="mx-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Social Login</Text>
                        <View className="flex-1 h-[1px] bg-white/5" />
                    </View>

                    {/* Social Buttons */}
                    <View className="flex-row gap-4 mb-8">
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-white/5 border border-white/10 h-14 rounded-2xl">
                           <Ionicons name="logo-google" size={20} color="white" />
                            <Text className="text-white text-sm font-bold">Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-white/5 border border-white/10 h-14 rounded-2xl">
                            <Ionicons name="logo-apple" size={20} color="white" />
                            <Text className="text-white text-sm font-bold">Apple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="mt-auto items-center">
                        <Text className="text-gray-400 text-sm italic font-medium">"Track every rep. Build real strength."</Text>
                        <View className="flex-row mt-6 gap-6">
                            <Text className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">Privacy</Text>
                            <Text className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">•</Text>
                            <Text className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">Terms</Text>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
