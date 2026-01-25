import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Modal, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { authApi, workoutApi } from '@/services/api';
import { useRouter, useFocusEffect } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProgressScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<any[]>([]);
    const [activeGraph, setActiveGraph] = useState<'Weight' | 'Volume'>('Volume');

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            const userData = await authApi.getMe();
            setUser(userData);

            const history = await workoutApi.getHistory(100); 
            if (history.success) {
                setWorkouts(history.workouts);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- Chart Data Helpers ---
    const getWeightData = () => {
        if (!user || !user.weightHistory || user.weightHistory.length === 0) {
            // Include current weight as single point if history empty
             if (user?.weight) return {
                labels: ['Now'],
                datasets: [{ data: [user.weight] }]
            };
            return { labels: [], datasets: [] };
        }
        
        // Take last 6 entries
        const history = user.weightHistory.slice(-6);
        return {
            labels: history.map((h: any) => new Date(h.date).getDate() + '/' + (new Date(h.date).getMonth()+1)),
            datasets: [{
                data: history.map((h: any) => h.weight)
            }]
        };
    };

    const getVolumeData = () => {
        if (workouts.length === 0) return { labels: [], datasets: [] };
        
        // Chronological order for chart
        const sorted = [...workouts].sort((a,b) => new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime()).slice(-6);
        
        return {
            labels: sorted.map((w: any) => new Date(w.endedAt).getDate() + '/' + (new Date(w.endedAt).getMonth()+1)),
            datasets: [{
                data: sorted.map(w => calculateVolume(w))
            }]
        };
    };

    const calculateVolume = (workout: any) => {
        return workout.exercises?.reduce((acc: number, ex: any) => 
            acc + (ex.sets?.reduce((s: number, set: any) => s + (set.weight * set.reps), 0) || 0), 0) || 0;
    };

    const formatDuration = (workout: any) => {
        if (!workout.endedAt || !workout.startedAt) return '--';
        const mins = Math.round((new Date(workout.endedAt).getTime() - new Date(workout.startedAt).getTime()) / 60000);
        return mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60}m` : `${mins}m`;
    };

    // Calculate streak
    const calculateStreak = () => {
        if (workouts.length === 0) return 0;
        const sorted = [...workouts].sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());
        const workoutDates = new Set(sorted.map(w => new Date(w.endedAt).toISOString().split('T')[0]));
        
        let streak = 0;
        let d = new Date();
        const today = d.toISOString().split('T')[0];
        
        // Include today?
        if (workoutDates.has(today)) {
             streak++;
             d.setDate(d.getDate() - 1);
        } else {
             // Check yesterday
             d.setDate(d.getDate() - 1);
             const yesterday = d.toISOString().split('T')[0];
             if (!workoutDates.has(yesterday)) return 0;
        }

        while (workoutDates.has(d.toISOString().split('T')[0])) {
            streak++;
            d.setDate(d.getDate() - 1);
        }
        return streak;
    };

    const streak = calculateStreak();
    const chartConfig = {
        backgroundGradientFrom: "#0f1115",
        backgroundGradientTo: "#0f1115",
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#3b82f6"
        }
    };

    const graphData = activeGraph === 'Weight' ? getWeightData() : getVolumeData();
    const hasGraphData = graphData.datasets.length > 0 && graphData.datasets[0].data.length > 0;

    // Calendar
    const getMarkedDates = () => {
        const marked: any = {};
        workouts.forEach(w => {
            const date = new Date(w.endedAt).toISOString().split('T')[0];
            marked[date] = { marked: true, dotColor: '#3b82f6' };
        });
        if (selectedDate) marked[selectedDate] = { ...marked[selectedDate], selected: true, selectedColor: '#3b82f6' };
        return marked;
    };
    
    const handleDateSelect = (day: any) => {
        setSelectedDate(day.dateString);
        const dayWorkouts = workouts.filter(w => new Date(w.endedAt).toISOString().split('T')[0] === day.dateString);
        setSelectedDayWorkouts(dayWorkouts);
        setShowCalendar(false);
    };

    if (loading) return <View className="flex-1 bg-charcoal items-center justify-center"><ActivityIndicator color="#3b82f6" /></View>;

    return (
        <SafeAreaView className="flex-1 bg-charcoal">
            <StatusBar style="light" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
                <Text className="text-2xl font-black text-white tracking-tight">PROGRESS</Text>
                <TouchableOpacity onPress={() => setShowCalendar(true)} className="w-10 h-10 rounded-full bg-field-dark border border-white/10 items-center justify-center">
                    <MaterialIcons name="calendar-today" size={20} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
                
                {/* Stats Row */}
                <View className="flex-row gap-4 mb-6">
                    <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} className="flex-1 bg-field-dark/50 border border-white/5 rounded-2xl p-4 active:bg-white/5">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Weight</Text>
                            <MaterialIcons name="chevron-right" size={16} color="#4b5563" />
                        </View>
                        <Text className="text-2xl font-black text-white">{user?.weight || '--'} <Text className="text-sm font-medium text-gray-500">kg</Text></Text>
                    </TouchableOpacity>
                    <View className="flex-1 bg-field-dark/50 border border-white/5 rounded-2xl p-4">
                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Streak</Text>
                        <View className="flex-row items-center gap-2">
                             <Text className="text-2xl font-black text-white">{streak}</Text>
                             <MaterialIcons name="local-fire-department" size={24} color={streak > 0 ? "#f97316" : "#4b5563"} />
                        </View>
                    </View>
                </View>

                {/* Graphs Section */}
                <View className="mb-8">
                     <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-white font-bold text-lg">Analytics</Text>
                        <View className="flex-row bg-field-dark rounded-lg p-1">
                            <Pressable 
                                onPress={() => setActiveGraph('Volume')} 
                                className={`px-3 py-1 rounded-md ${activeGraph === 'Volume' ? 'bg-white/10' : ''}`}
                            >
                                <Text className={`text-xs font-bold ${activeGraph === 'Volume' ? 'text-white' : 'text-gray-500'}`}>Volume</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => setActiveGraph('Weight')} 
                                className={`px-3 py-1 rounded-md ${activeGraph === 'Weight' ? 'bg-white/10' : ''}`}
                            >
                                <Text className={`text-xs font-bold ${activeGraph === 'Weight' ? 'text-white' : 'text-gray-500'}`}>Weight</Text>
                            </Pressable>
                        </View>
                    </View>
                    
                    {hasGraphData ? (
                        <LineChart
                            data={graphData}
                            width={SCREEN_WIDTH - 48}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                                backgroundColor: '#0f1115' // Force ViewShot background match or custom container
                            }}
                            withInnerLines={true}
                            withOuterLines={false}
                            withVerticalLines={false}
                            yAxisLabel=""
                            yAxisSuffix={activeGraph === 'Weight' ? 'kg' : ''}
                        />
                    ) : (
                        <View className="h-56 bg-field-dark/30 rounded-2xl items-center justify-center border border-white/5">
                            <Text className="text-gray-500 text-sm">Not enough data for graph</Text>
                        </View>
                    )}
                </View>

                {/* Selected Day or Last Workout */}
                {selectedDate ? (
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                             <Text className="text-white text-lg font-bold">
                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedDate(null)}>
                                <Text className="text-primary text-xs font-bold uppercase">Clear</Text>
                            </TouchableOpacity>
                        </View>
                       {selectedDayWorkouts.length > 0 ? (
                           <View className="gap-3">
                               {selectedDayWorkouts.map((w, i) => (
                                   <TouchableOpacity 
                                       key={i} 
                                       onPress={() => router.push({ pathname: '/workout-details/[id]', params: { id: w._id }})}
                                       className="bg-field-dark/50 border border-white/5 rounded-xl p-4 active:bg-white/5"
                                   >
                                        <Text className="text-white font-bold capitalize mb-2">{w.type}</Text>
                                        <View className="flex-row gap-4">
                                            <View className="flex-row items-center gap-1">
                                                <MaterialIcons name="timer" size={14} color="#9ca3af" />
                                                <Text className="text-gray-500 text-xs">{formatDuration(w)}</Text>
                                            </View>
                                            <View className="flex-row items-center gap-1">
                                                <MaterialIcons name="fitness-center" size={14} color="#9ca3af" />
                                                <Text className="text-gray-500 text-xs">{calculateVolume(w).toLocaleString()} kg</Text>
                                            </View>
                                        </View>
                                   </TouchableOpacity>
                               ))}
                           </View>
                       ) : (
                           <Text className="text-gray-500 text-center italic mt-4">No workouts on this day.</Text>
                       )}
                    </View>
                ) : (
                    <View className="mb-8">
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Last Workout</Text>
                        {workouts.length > 0 ? (
                            (() => {
                                const lastWorkout = [...workouts].sort((a,b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime())[0];
                                return (
                                    <TouchableOpacity 
                                        onPress={() => router.push({ pathname: '/workout-details/[id]', params: { id: lastWorkout._id } })}
                                        className="bg-field-dark/50 border border-white/5 rounded-2xl p-5 active:bg-white/5"
                                    >
                                        <View className="flex-row items-center justify-between mb-3">
                                            <View className="flex-row items-center gap-3">
                                                <View className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center">
                                                    <MaterialIcons name="fitness-center" size={24} color="#3b82f6" />
                                                </View>
                                                <View>
                                                    <Text className="text-white font-bold text-lg capitalize">{lastWorkout.type || 'Strength'}</Text>
                                                    <Text className="text-gray-500 text-xs">
                                                        {new Date(lastWorkout.endedAt).toLocaleDateString('en-US', { 
                                                            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </Text>
                                                </View>
                                            </View>
                                            <MaterialIcons name="chevron-right" size={24} color="#4b5563" />
                                        </View>
                                        
                                        <View className="flex-row gap-6 mt-2">
                                            <View>
                                                <Text className="text-gray-600 text-[10px] font-bold uppercase">Duration</Text>
                                                <Text className="text-white font-bold">{formatDuration(lastWorkout)}</Text>
                                            </View>
                                            <View>
                                                <Text className="text-gray-600 text-[10px] font-bold uppercase">Volume</Text>
                                                <Text className="text-white font-bold">{calculateVolume(lastWorkout).toLocaleString()} kg</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })()
                        ) : (
                             <View className="bg-field-dark/30 rounded-2xl p-8 items-center border border-white/5">
                                <Text className="text-gray-500">No workouts recorded yet.</Text>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>

            <Modal visible={showCalendar} animationType="slide" transparent onRequestClose={() => setShowCalendar(false)}>
                 <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-charcoal rounded-t-3xl pb-8">
                        <View className="flex-row justify-between p-4 border-b border-white/10">
                            <Text className="text-white font-bold text-lg">History</Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}><MaterialIcons name="close" size={24} color="white"/></TouchableOpacity>
                        </View>
                        <Calendar 
                            markedDates={getMarkedDates()}
                            onDayPress={handleDateSelect}
                            theme={{
                                backgroundColor: '#0f1115',
                                calendarBackground: '#0f1115',
                                dayTextColor: '#fff',
                                textDisabledColor: '#333',
                                monthTextColor: '#fff',
                                selectedDayBackgroundColor: '#3b82f6',
                                todayTextColor: '#3b82f6',
                                arrowColor: '#3b82f6'
                            }}
                        />
                    </View>
                 </View>
            </Modal>
        </SafeAreaView>
    );
}
