import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { workoutApi } from '@/services/api';

export default function WorkoutHistoryScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch more history, e.g. 50 items
                const result = await workoutApi.getHistory(50);
                if (result.success) {
                    setHistory(result.workouts);
                }
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const calcVolume = (workout: any) => {
        if(!workout) return 0;
        return workout.exercises?.reduce((acc: number, ex: any) => acc + ex.sets.reduce((s: number, set: any) => s + (set.weight * set.reps), 0), 0) || 0;
    };

    return (
        <SafeAreaView className="flex-1 bg-charcoal">
            <StatusBar style="light" />
            
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-field-dark">
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">All Workouts</Text>
                <View className="w-10" />
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 50 }}>
                    {history.length === 0 ? (
                        <View className="mt-20 items-center">
                            <Text className="text-gray-500">No workout history found.</Text>
                        </View>
                    ) : (
                        history.map((session) => (
                             <TouchableOpacity 
                                key={session._id} 
                                onPress={() => router.push({ pathname: '/workout-details/[id]', params: { id: session._id } })}
                                className="flex-row items-center justify-between p-4 bg-field-dark rounded-2xl mb-3 border border-white/5 active:bg-white/5"
                            >
                                <View className="flex-row items-center gap-4">
                                     <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                                         {/* Date number */}
                                        <Text className="text-primary font-bold text-sm">{new Date(session.startedAt).getDate()}</Text>
                                        <Text className="text-primary/60 font-bold text-[10px] uppercase">{new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short' })}</Text>
                                     </View>
                                     <View>
                                         <Text className="text-white font-bold capitalize text-base">{session.type || 'Workout'}</Text>
                                         <Text className="text-gray-500 text-xs">{new Date(session.startedAt).toLocaleDateString('en-US', { weekday: 'long',  year: 'numeric' })}</Text>
                                     </View>
                                </View>
                                <View className="items-end">
                                     <View className="flex-row items-baseline gap-1">
                                        <Text className="text-white font-bold text-sm">{session.exercises?.length || 0}</Text>
                                        <Text className="text-gray-500 text-[10px] uppercase">Ex</Text>
                                     </View>
                                     <Text className="text-gray-500 text-xs font-mono">{calcVolume(session) > 0 ? (calcVolume(session)/1000).toFixed(1) + 'k' : '-'} kg</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
