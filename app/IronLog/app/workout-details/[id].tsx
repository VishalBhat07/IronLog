import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { workoutApi } from '@/services/api';

export default function WorkoutDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const result = await workoutApi.getById(id as string);
                if (result.success) {
                    setWorkout(result.workout);
                }
            } catch (error) {
                console.error("Failed to load workout details", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-charcoal items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        );
    }

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-charcoal items-center justify-center">
                <Text className="text-white">Workout not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-primary font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Calculations
    const totalVolume = workout.exercises.reduce((acc: number, ex: any) => {
        return acc + ex.sets.reduce((sAcc: number, set: any) => sAcc + (set.weight * set.reps), 0);
    }, 0);

    const totalSets = workout.exercises.reduce((acc: number, ex: any) => acc + ex.sets.length, 0);
    const durationMin = workout.endedAt 
        ? Math.round((new Date(workout.endedAt).getTime() - new Date(workout.startedAt).getTime()) / 60000) 
        : 0;
    
    const dateStr = new Date(workout.startedAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    return (
        <SafeAreaView className="flex-1 bg-charcoal">
            <StatusBar style="light" />
            
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-field-dark">
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Workout Details</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 50 }}>
                {/* Summary Card */}
                <View className="bg-card-dark p-6 rounded-3xl border border-white/5 mb-8">
                    <Text className="text-primary text-xs font-bold uppercase tracking-widest mb-1">{workout.type || 'Strength'}</Text>
                    <Text className="text-white text-2xl font-black mb-4">{dateStr}</Text>
                    
                    <View className="flex-row justify-between">
                        <View>
                            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Duration</Text>
                            <Text className="text-white text-lg font-bold">{durationMin} min</Text>
                        </View>
                        <View>
                            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Volume</Text>
                            <Text className="text-white text-lg font-bold">{totalVolume.toLocaleString()} kg</Text>
                        </View>
                         <View>
                            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Sets</Text>
                            <Text className="text-white text-lg font-bold">{totalSets}</Text>
                        </View>
                    </View>

                    {workout.notes && (
                        <View className="mt-4 pt-4 border-t border-white/5">
                             <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Notes</Text>
                             <Text className="text-gray-400 text-sm italic">"{workout.notes}"</Text>
                        </View>
                    )}
                </View>

                {/* Exercises List */}
                <Text className="text-white text-lg font-black mb-4 px-2">Exercises Performed</Text>
                
                {workout.exercises.map((exercise: any) => (
                    <View key={exercise._id} className="bg-field-dark/50 rounded-2xl mb-4 overflow-hidden border border-white/5">
                         <View className="bg-field-dark p-4 border-b border-white/5 flex-row justify-between items-center">
                            <Text className="text-white font-bold text-base">{exercise.name}</Text>
                            <Text className="text-gray-500 text-xs">{exercise.target}</Text>
                         </View>
                         <View className="p-4">
                            <View className="flex-row mb-2">
                                <Text className="w-8 text-center text-gray-600 text-[10px] uppercase font-bold">#</Text>
                                <Text className="flex-1 text-center text-gray-600 text-[10px] uppercase font-bold">Kg</Text>
                                <Text className="flex-1 text-center text-gray-600 text-[10px] uppercase font-bold">Reps</Text>
                            </View>
                            {exercise.sets.map((set: any, idx: number) => (
                                <View key={set._id || idx} className="flex-row mb-2 py-1">
                                    <Text className="w-8 text-center text-gray-400 font-bold">{idx + 1}</Text>
                                    <Text className="flex-1 text-center text-white font-bold">{set.weight}</Text>
                                    <Text className="flex-1 text-center text-white font-bold">{set.reps}</Text>
                                </View>
                            ))}
                         </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
