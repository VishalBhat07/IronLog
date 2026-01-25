import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { workoutApi } from '@/services/api';
import ViewShot from 'react-native-view-shot';

export default function WorkoutCompleteScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [workout, setWorkout] = useState<any>(null);
    const viewShotRef = useRef<any>(null);

    useEffect(() => {
        if (id) {
            workoutApi.getById(id as string).then((res) => {
                if(res.success) setWorkout(res.workout);
            });
        }
    }, [id]);

    if (!workout) return <View className="flex-1 bg-charcoal" />;

    // Calcs
    const durationMin = workout.endedAt 
        ? Math.round((new Date(workout.endedAt).getTime() - new Date(workout.startedAt).getTime()) / 60000) 
        : 0;
    const durationHrs = Math.floor(durationMin / 60);
    const durationMins = durationMin % 60;
    const durationStr = durationHrs > 0 ? `${durationHrs}h ${durationMins}m` : `${durationMins}m`;

    const totalVolume = workout.exercises.reduce((acc: number, ex: any) => {
        return acc + ex.sets.reduce((s: number, set: any) => s + (set.weight * set.reps), 0);
    }, 0);

    const handleShare = async () => {
        try {
            if (viewShotRef.current && viewShotRef.current.capture) {
                const uri = await viewShotRef.current.capture();
                
                await Share.share({
                    // On iOS, url is enough. On Android, mostly works or sends text + link.
                    url: uri, 
                    title: 'IronLog Workout',
                    message: Platform.OS === 'android' ? 'Check out my workout on IronLog!' : undefined 
                });
            }
        } catch (error: any) {
            Alert.alert("Error", "Could not capture image");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-charcoal items-center relative">
            <StatusBar style="light" />

            {/* Background Glows */}
            <View className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <View className="absolute top-1/4 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />

            {/* Confetti (Static Mock) */}
            <View className="absolute inset-0 pointer-events-none opacity-60">
                <View className="absolute w-2 h-2 rounded-sm bg-blue-500 top-10 left-10 rotate-12" />
                <View className="absolute w-2 h-2 rounded-sm bg-yellow-400 top-20 left-24 -rotate-45" />
                <View className="absolute w-2 h-2 rounded-sm bg-pink-500 top-12 right-12 rotate-45" />
                <View className="absolute w-2 h-2 rounded-sm bg-green-400 top-24 right-20 -rotate-12" />
                <View className="absolute w-2 h-2 rounded-sm bg-purple-500 top-4 left-1/2" />
                <View className="absolute w-2 h-2 rounded-sm bg-orange-400 top-36 right-10 -rotate-45" />
            </View>

            <View className="w-full max-w-[390px] flex-1 flex-col">
                
                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                    <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9, result: 'tmpfile' }} style={{ backgroundColor: '#0f1115' }}>
                        
                        {/* Header */}
                        <View className="items-center pt-8 pb-8 px-6 bg-charcoal">
                            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4 border border-primary/30 shadow-lg shadow-primary/40">
                                <MaterialIcons name="celebration" size={40} color="#3b82f6" />
                            </View>
                            <Text className="text-3xl font-black text-white tracking-tight text-center">Workout Complete!</Text>
                            <Text className="text-gray-400 font-medium mt-1 uppercase text-xs tracking-wider">
                                {workout.type || 'Workout'} • {new Date(workout.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>

                        {/* Stats Grid */}
                        <View className="px-6 bg-charcoal pb-6">
                            <View className="bg-field-dark/40 border border-white/5 rounded-2xl p-6">
                                <View className="flex-row flex-wrap justify-between gap-y-6">
                                    <View className="w-[48%]">
                                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Duration</Text>
                                        <View className="flex-row items-center gap-2">
                                            <MaterialIcons name="timer" size={20} color="#3b82f6" />
                                            <Text className="text-xl font-bold text-white uppercase">{durationStr}</Text>
                                        </View>
                                    </View>

                                    <View className="w-[48%]">
                                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Volume</Text>
                                        <View className="flex-row items-center gap-2">
                                            <MaterialIcons name="fitness-center" size={20} color="#3b82f6" />
                                            <View className="flex-row items-baseline">
                                                <Text className="text-xl font-bold text-white">{totalVolume.toLocaleString()}</Text>
                                                <Text className="text-xs text-gray-500 ml-1">kg</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View className="w-[48%]">
                                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Avg Intensity</Text>
                                        <View className="flex-row items-center gap-2">
                                            <MaterialIcons name="bolt" size={20} color="#3b82f6" />
                                            <Text className="text-xl font-bold text-white">84%</Text>
                                        </View>
                                    </View>

                                    <View className="w-[48%] justify-center">
                                        <View className="flex-row items-center bg-accent-orange/10 border border-accent-orange/20 rounded-lg px-3 py-1.5 self-start">
                                            <MaterialCommunityIcons name="medal" size={14} color="#f97316" style={{ marginRight: 4 }} />
                                            <Text className="text-accent-orange text-[10px] font-black uppercase tracking-wider">New PR!</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Highlights */}
                        <View className="px-6 bg-charcoal pb-8">
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Exercise Highlights</Text>
                            <View className="gap-3">
                                {workout.exercises.map((ex: any, idx: number) => {
                                    const bestSet = ex.sets.reduce((prev:any, current:any) => (prev.weight * prev.reps > current.weight * current.reps) ? prev : current, ex.sets[0] || {});

                                    return (
                                        <View key={idx} className="bg-field-dark/50 border border-white/5 rounded-xl p-4 flex-row items-center justify-between">
                                            <View className="flex-row items-center gap-3">
                                                <View className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 items-center justify-center">
                                                    <Text className="text-white font-bold text-lg">{idx + 1}</Text>
                                                </View>
                                                <View>
                                                    <Text className="text-white font-bold text-sm">{ex.name}</Text>
                                                    {bestSet.weight ? (
                                                        <Text className="text-gray-500 text-xs">Best: <Text className="text-gray-300">{bestSet.weight}kg x {bestSet.reps}</Text></Text>
                                                    ) : <Text className="text-gray-500 text-xs">No sats recorded</Text>}
                                                </View>
                                            </View>
                                            {idx === 0 && <MaterialIcons name="star" size={20} color="#f97316" />}
                                        </View>
                                    );
                                })}
                            </View>
                             
                            {/* Watermark */}
                            <View className="items-center mt-8">
                                <Text className="text-gray-700 text-[10px] font-black uppercase tracking-[0.2em]">Logged with IronLog</Text>
                            </View>
                        </View>
                    </ViewShot>
                </ScrollView>

                {/* Footer Buttons */}
                <View className="bg-charcoal/80 px-6 pt-4 pb-8 border-t border-white/5">
                     <View className="gap-3 mb-6">
                        <TouchableOpacity 
                            onPress={() => router.replace('/(tabs)')}
                            className="w-full bg-primary h-14 rounded-xl shadow-lg shadow-primary/20 items-center justify-center active:scale-[0.98]"
                        >
                             <Text className="text-white font-black uppercase tracking-wider text-sm">Done</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={handleShare}
                            className="w-full bg-field-dark border border-white/10 h-12 rounded-xl items-center justify-center flex-row gap-2 active:scale-[0.98]"
                        >
                            <MaterialIcons name="share" size={18} color="white" />
                            <Text className="text-white font-bold text-sm">Share Progress</Text>
                        </TouchableOpacity>
                     </View>
                </View>

            </View>
        </SafeAreaView>
    );
}
