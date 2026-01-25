import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

interface Set {
    id: number;
    weight: string;
    reps: string;
    completed: boolean;
}

interface Exercise {
    id: number;
    name: string;
    target: string;
    sets: Set[];
}

export default function WorkoutSessionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [duration, setDuration] = useState(0);
    const [exercises, setExercises] = useState<Exercise[]>([
        {
            id: 1,
            name: 'Bench Press',
            target: 'Chest • Barbell',
            sets: [
                { id: 1, weight: '80', reps: '10', completed: true },
                { id: 2, weight: '', reps: '', completed: false },
            ]
        },
        {
            id: 2,
            name: 'Incline DB Fly',
            target: 'Chest • Dumbbell',
            sets: [
                { id: 1, weight: '', reps: '', completed: false },
            ]
        }
    ]);

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleSet = (exerciseId: number, setId: number) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
            };
        }));
    };

    const addSet = (exerciseId: number) => {
        setExercises(prev => prev.map(ex => {
            if (ex.id !== exerciseId) return ex;
            const lastSet = ex.sets[ex.sets.length - 1];
            return {
                ...ex,
                sets: [...ex.sets, { 
                    id: ex.sets.length + 1, 
                    weight: lastSet ? lastSet.weight : '', 
                    reps: lastSet ? lastSet.reps : '', 
                    completed: false 
                }]
            };
        }));
    };

    const handleEndWorkout = () => {
        Alert.alert(
            "End Workout",
            "Are you sure you want to finish this session?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Finish", onPress: () => router.back() }
            ]
        );
    };

    return (
        <View className="flex-1 bg-charcoal">
            <StatusBar style="light" />
            
            {/* Header with Dynamic Insets */}
            <View 
                className="flex-row items-center justify-between px-6 pb-4 bg-charcoal border-b border-white/5 z-20"
                style={{ paddingTop: insets.top + 10 }}
            >
                <View>
                    <Text className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Session</Text>
                    <Text className="text-2xl font-black text-white tracking-tight tabular-nums">{formatTime(duration)}</Text>
                </View>
                <TouchableOpacity 
                    onPress={handleEndWorkout}
                    className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl active:scale-95"
                >
                    <Text className="text-red-500 text-sm font-bold">End Workout</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>
                    {exercises.map((exercise) => (
                        <View key={exercise.id} className="bg-card-dark rounded-3xl border border-white/5 overflow-hidden shadow-sm mb-6">
                            {/* Exercise Header */}
                            <View className="p-5 flex-row justify-between items-center border-b border-white/5">
                                <View>
                                    <Text className="text-white text-xl font-black tracking-tight">{exercise.name}</Text>
                                    <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider">{exercise.target}</Text>
                                </View>
                                <TouchableOpacity>
                                    <MaterialIcons name="more-horiz" size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Sets Table */}
                            <View className="p-4">
                                <View className="flex-row mb-2">
                                    <Text className="w-12 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Set</Text>
                                    <Text className="flex-1 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Weight (kg)</Text>
                                    <Text className="flex-1 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Reps</Text>
                                    <Text className="w-12 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest"></Text>
                                </View>

                                {exercise.sets.map((set, index) => (
                                    <View key={set.id} className={`flex-row items-center mb-3 p-1 rounded-xl ${set.completed ? 'bg-primary/10' : ''}`}>
                                        <View className="w-12 items-center justify-center">
                                            <View className="bg-field-dark px-2 py-1 rounded-lg">
                                                <Text className="text-white text-xs font-black">{index + 1}</Text>
                                            </View>
                                        </View>
                                        <View className="flex-1 px-1">
                                            <TextInput 
                                                className="w-full h-12 bg-field-dark text-white text-center text-lg font-bold rounded-xl"
                                                defaultValue={set.weight}
                                                keyboardType="numeric"
                                                placeholderTextColor="#4b5563"
                                            />
                                        </View>
                                        <View className="flex-1 px-1">
                                            <TextInput 
                                                className="w-full h-12 bg-field-dark text-white text-center text-lg font-bold rounded-xl"
                                                defaultValue={set.reps}
                                                keyboardType="numeric"
                                                placeholderTextColor="#4b5563"
                                            />
                                        </View>
                                        <View className="w-12 items-center justify-center">
                                            <TouchableOpacity 
                                                onPress={() => toggleSet(exercise.id, set.id)}
                                                className={`w-10 h-10 rounded-full items-center justify-center ${set.completed ? 'bg-primary' : 'border-2 border-white/10'}`}
                                            >
                                                <MaterialIcons name="check" size={20} color={set.completed ? 'white' : '#4b5563'} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}

                                <TouchableOpacity 
                                    onPress={() => addSet(exercise.id)}
                                    className="mt-4 w-full py-3 rounded-xl border border-dashed border-white/10 flex-row items-center justify-center gap-2 active:bg-white/5"
                                >
                                    <MaterialIcons name="add" size={16} color="#9ca3af" />
                                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Add Set</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Gradient Overlay */}
            <View className="absolute bottom-0 w-full h-12 bg-charcoal/10" />

            {/* Floating Add Exercise Button */}
            <TouchableOpacity 
                onPress={() => router.push('/add-exercise')}
                className="absolute bottom-10 right-6 w-16 h-16 bg-primary rounded-full shadow-2xl shadow-primary/40 items-center justify-center active:scale-90"
            >
                <MaterialIcons name="add" size={32} color="white" />
            </TouchableOpacity>

        </View>
    );
}
