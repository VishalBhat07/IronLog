import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { workoutApi } from '@/services/api';

export default function WorkoutScreen() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState('Strength');
    const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
    const [lastWorkoutId, setLastWorkoutId] = useState<string | null>(null);
    const workoutTypes = ['Strength', 'Cardio', 'Mixed', 'Recovery'];

    useFocusEffect(
        useCallback(() => {
            const checkData = async () => {
                try {
                    // Check active
                    const activeRes = await workoutApi.getActive();
                    if (activeRes.active && activeRes.workout) {
                        setActiveWorkoutId(activeRes.workout._id);
                    } else {
                        setActiveWorkoutId(null);
                    }

                    // Get Last Workout for 'Previous Routine'
                    const historyRes = await workoutApi.getHistory(1);
                    if (historyRes.success && historyRes.workouts.length > 0) {
                        setLastWorkoutId(historyRes.workouts[0]._id);
                    } else {
                        setLastWorkoutId(null);
                    }
                } catch (e) {
                    console.log('Error checking workout status');
                }
            };
            checkData();
        }, [])
    );

    const handleStartSession = async () => {
        if (activeWorkoutId) {
            router.push({ pathname: '/workout-session', params: { workoutId: activeWorkoutId } });
            return;
        }

        try {
            const result = await workoutApi.start(selectedType.toLowerCase());
            if (result.success) {
                router.push({
                    pathname: '/workout-session',
                    params: { workoutId: result.workoutId }
                });
            }
        } catch (error) {
            console.error('Failed to start workout', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-charcoal">
            <StatusBar style="light" />
            
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
                <Text className="text-white text-2xl font-black tracking-tight">
                    {activeWorkoutId ? 'Resume Workout' : 'Start Workout'}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                    <MaterialIcons name="settings" size={24} color="#9ca3af" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 150 }}>
                {/* Workout Type Selector */}
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-6 mb-4">Select Workout Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 mb-8" contentContainerStyle={{ gap: 12 }}>
                    {workoutTypes.map((type) => (
                        <TouchableOpacity 
                            key={type}
                            onPress={() => setSelectedType(type)}
                            className={`px-6 py-3 rounded-xl border ${selectedType === type ? 'bg-primary border-primary' : 'bg-field-dark border-white/5'}`}
                        >
                            <Text className={`font-bold text-sm ${selectedType === type ? 'text-white' : 'text-gray-400'}`}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Workout Notes */}
                <View className="mt-2">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
                        Workout Notes <Text className="text-gray-600 normal-case">(optional)</Text>
                    </Text>
                    <TextInput 
                        className="w-full h-40 bg-field-dark border border-white/10 rounded-2xl text-white text-base p-4"
                        placeholder="e.g. Focus on form, legs feeling heavy from yesterday..."
                        placeholderTextColor="#4b5563"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                {/* Previous Routine Card */}
                <TouchableOpacity 
                    disabled={!lastWorkoutId}
                    onPress={() => lastWorkoutId && router.push({ pathname: '/workout-details/[id]', params: { id: lastWorkoutId } })}
                    className="mt-8 p-5 bg-primary/5 border border-primary/10 rounded-2xl flex-row items-center gap-4 active:bg-primary/10"
                >
                    <View className="bg-primary/20 p-2 rounded-lg">
                        <MaterialIcons name="history" size={24} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-sm font-bold">Previous Routine</Text>
                        <Text className="text-gray-500 text-xs">
                             {lastWorkoutId ? 'View details of your last session' : 'No history yet'}
                        </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#4b5563" />
                </TouchableOpacity>

            </ScrollView>

            {/* Fixed Bottom Action */}
            <View className="absolute left-0 right-0 p-6 bg-charcoal/90 border-t border-white/5" style={{ bottom: 80, paddingBottom: 20 }}>
                 <TouchableOpacity 
                    onPress={handleStartSession}
                    className="w-full bg-primary h-16 rounded-2xl items-center justify-center shadow-lg shadow-primary/30 active:scale-[0.98]"
                >
                    <Text className="text-white font-black text-lg uppercase tracking-widest">
                         {activeWorkoutId ? 'Resume Session' : 'Start Session'}
                    </Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
