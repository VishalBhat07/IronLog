import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { workoutApi } from '@/services/api';

export default function WorkoutSessionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { workoutId } = useLocalSearchParams();
    
    const [duration, setDuration] = useState(0);
    const [exercises, setExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Workout Data on Focus (handles returning from Add Exercise)
    useFocusEffect(
        useCallback(() => {
            if (!workoutId) return;
            const fetchWorkout = async () => {
                try {
                    const result = await workoutApi.getById(workoutId as string);
                    if (result.success && result.workout) {
                        setExercises(result.workout.exercises || []);
                        
                        // Calculate duration
                        const start = new Date(result.workout.startedAt).getTime();
                        const now = new Date().getTime();
                        const seconds = Math.floor((now - start) / 1000);
                        setDuration(seconds > 0 ? seconds : 0);
                    }
                } catch (error) {
                    console.error('Error fetching workout', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchWorkout();
        }, [workoutId])
    );

    // Timer logic
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

    const handleAddSet = async (exerciseId: string, reps: string, weight: string) => {
        if (!reps || !weight) return;
        try {
            const result = await workoutApi.addSet(workoutId as string, exerciseId, parseInt(reps), parseFloat(weight));
            if (result.success) {
                // Determine which set was added
                const newSet = result.set;
                
                // Update local state by finding exercise and appending set
                setExercises(prev => prev.map(ex => {
                    if (ex._id !== exerciseId) return ex;
                    return { ...ex, sets: [...ex.sets, newSet] };
                }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to log set');
        }
    };

    const handleEndWorkout = async () => {
        Alert.alert(
            "End Workout",
            "Are you sure you want to finish this session?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Finish", 
                    onPress: async () => {
                        try {
                            await workoutApi.finish(workoutId as string);
                            router.replace({ pathname: '/workout-complete', params: { id: workoutId } });
                        } catch (error) {
                            Alert.alert('Error', 'Failed to finish workout');
                        }
                    } 
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-charcoal">
            <StatusBar style="light" />
            
            {/* Header */}
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
                        <View key={exercise._id} className="bg-card-dark rounded-3xl border border-white/5 overflow-hidden shadow-sm mb-6">
                            <View className="p-5 flex-row justify-between items-center border-b border-white/5">
                                <View>
                                    <Text className="text-white text-xl font-black tracking-tight">{exercise.name}</Text>
                                    <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider">{exercise.target || 'Muscle'}</Text>
                                </View>
                            </View>

                            <View className="p-4">
                                <View className="flex-row mb-2">
                                    <Text className="w-12 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Set</Text>
                                    <Text className="flex-1 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Weight</Text>
                                    <Text className="flex-1 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Reps</Text>
                                    <Text className="w-12 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest"></Text>
                                </View>

                                {exercise.sets.map((set: any, index: number) => (
                                    <View key={set._id || index} className="flex-row items-center mb-3 p-1 rounded-xl bg-primary/5">
                                        <View className="w-12 items-center justify-center">
                                            <Text className="text-white text-xs font-black">{index + 1}</Text>
                                        </View>
                                        <Text className="flex-1 text-center text-white font-bold text-lg">{set.weight}</Text>
                                        <Text className="flex-1 text-center text-white font-bold text-lg">{set.reps}</Text>
                                        <View className="w-12 items-center justify-center">
                                            <MaterialIcons name="check-circle" size={20} color="#3b82f6" />
                                        </View>
                                    </View>
                                ))}

                                {/* Input Row for New Set */}
                                <SetInputRow onAdd={(r, w) => handleAddSet(exercise._id, r, w)} nextIndex={exercise.sets.length + 1} />
                            </View>
                        </View>
                    ))}
                    
                    {exercises.length === 0 && !loading && (
                        <View className="items-center justify-center py-20">
                            <Text className="text-gray-500">No exercises added yet.</Text>
                            <Text className="text-gray-600 text-xs mt-2">Tap + to add one.</Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="absolute bottom-0 w-full h-12 bg-charcoal/10" />

            {/* Floating Add Exercise Button */}
            <TouchableOpacity 
                onPress={() => router.push({ pathname: '/add-exercise', params: { workoutId } })}
                className="absolute bottom-10 right-6 w-16 h-16 bg-primary rounded-full shadow-2xl shadow-primary/40 items-center justify-center active:scale-90"
            >
                <MaterialIcons name="add" size={32} color="white" />
            </TouchableOpacity>

        </View>
    );
}

// Subcomponent for Set Input
function SetInputRow({ onAdd, nextIndex }: { onAdd: (reps: string, weight: string) => void, nextIndex: number }) {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');

    const handleCheck = () => {
        if(weight && reps) {
            onAdd(reps, weight);
            setReps(''); // reset reps, keep weight often helpful but user might want clear
            // Actually reset both for now
            setWeight('');
        }
    };

    return (
        <View className="flex-row items-center mb-3 p-1 rounded-xl">
            <View className="w-12 items-center justify-center"><Text className="text-gray-500 font-bold">{nextIndex}</Text></View>
            <View className="flex-1 px-1">
                <TextInput 
                    className="w-full h-12 bg-field-dark text-white text-center text-lg font-bold rounded-xl"
                    keyboardType="numeric"
                    placeholder="kg"
                    placeholderTextColor="#4b5563"
                    value={weight}
                    onChangeText={setWeight}
                />
            </View>
             <View className="flex-1 px-1">
                <TextInput 
                    className="w-full h-12 bg-field-dark text-white text-center text-lg font-bold rounded-xl"
                    keyboardType="numeric"
                    placeholder="reps"
                    placeholderTextColor="#4b5563"
                    value={reps}
                    onChangeText={setReps}
                />
            </View>
            <TouchableOpacity onPress={handleCheck} className="w-12 items-center justify-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${weight && reps ? 'bg-primary' : 'border-2 border-white/10'}`}>
                    <MaterialIcons name="check" size={20} color={weight && reps ? 'white' : '#4b5563'} />
                </View>
            </TouchableOpacity>
        </View>
    );
}
