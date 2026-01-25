import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { workoutApi } from '@/services/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useFocusEffect(
    useCallback(() => {
        const fetchData = async () => {
            try {
                // Check Active
                const activeRes = await workoutApi.getActive();
                if (activeRes.active && activeRes.workout) {
                    setActiveWorkoutId(activeRes.workout._id);
                } else {
                    setActiveWorkoutId(null);
                }

                // Get History
                const historyRes = await workoutApi.getHistory(5);
                if (historyRes.success) {
                    setHistory(historyRes.workouts);
                }
            } catch (e) {
                console.log('Error fetching dashboard data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [])
  );

  const lastWorkout = history.length > 0 ? history[0] : null;

  // Helper to calc volume (rough)
  const calcVolume = (workout: any) => {
      if(!workout) return 0;
      return workout.exercises?.reduce((acc: number, ex: any) => acc + ex.sets.reduce((s: number, set: any) => s + (set.weight * set.reps), 0), 0) || 0;
  };

  const calcSets = (workout: any) => {
      if(!workout) return 0;
      return workout.exercises?.reduce((acc: number, ex: any) => acc + ex.sets.length, 0) || 0;
  };

  return (
    <SafeAreaView className="flex-1 bg-charcoal relative">
       <StatusBar style="light" />
      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 150 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-start mb-8">
            <View>
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{currentDate}</Text>
                <Text className="text-white text-2xl font-black">Good Evening, {user?.name?.split(' ')[0] || 'Athlete'}</Text>
            </View>
            <View className="w-10 h-10 rounded-full border border-white/10 bg-card-dark items-center justify-center overflow-hidden">
                <MaterialIcons name="person" size={24} color="#9ca3af" />
            </View>
        </View>

        {/* ... Active/Start Workout Card ... */}
        <View className={`rounded-3xl p-6 border relative overflow-hidden mb-6 ${activeWorkoutId ? 'bg-primary/5 border-primary/20' : 'bg-card-dark border-white/5'}`}>
             <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-primary text-sm font-bold uppercase tracking-wider">{activeWorkoutId ? 'Active Session' : "Let's Crush It"}</Text>
                    <Text className="text-white text-xl font-bold mt-1">{activeWorkoutId ? 'Resuming...' : 'Start New Session'}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full border ${activeWorkoutId ? 'bg-green-500/10 border-green-500/20' : 'bg-primary/10 border-primary/20'}`}>
                    <Text className={`${activeWorkoutId ? 'text-green-500' : 'text-primary'} text-[10px] font-black uppercase tracking-widest`}>
                        {activeWorkoutId ? 'In Progress' : 'Ready'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push(activeWorkoutId ? { pathname: '/workout-session', params: { workoutId: activeWorkoutId } } : '/workout')}
                className="w-full bg-primary h-14 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
                <MaterialIcons name={activeWorkoutId ? "refresh" : "play-arrow"} size={24} color="white" />
                <Text className="text-white font-black text-lg uppercase tracking-wider">
                    {activeWorkoutId ? 'Resume Workout' : 'Start Workout'}
                </Text>
            </TouchableOpacity>

        </View>

        {/* Last Workout Card */}
        {lastWorkout ? (
            <View className="bg-card-dark rounded-3xl p-6 border border-white/5 mb-6">
                <View className="flex-row items-center gap-3 mb-6">
                    <View className="bg-accent-orange/10 p-2 rounded-xl border border-accent-orange/20">
                        <MaterialIcons name="history" size={20} color="#f97316" />
                    </View>
                    <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider">Last Workout</Text>
                </View>

                <View className="flex-row justify-between items-end">
                    <View>
                        <Text className="text-white text-2xl font-black mb-1 capitalize">{lastWorkout.type || 'Strength'}</Text>
                        <Text className="text-gray-500 text-xs font-medium">
                            {new Date(lastWorkout.startedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                    <View className="items-end">
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-white text-xl font-black">{calcVolume(lastWorkout).toLocaleString()}</Text>
                            <Text className="text-gray-500 text-xs font-bold">kg</Text>
                        </View>
                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Volume</Text>
                    </View>
                </View>

                <View className="mt-6 pt-6 border-t border-white/5 flex-row justify-between items-center">
                    <View className="flex-row gap-4">
                        <View>
                            <Text className="text-white font-bold text-sm">{lastWorkout.exercises?.length || 0}</Text>
                            <Text className="text-gray-500 text-[10px] font-bold uppercase">Moves</Text>
                        </View>
                        <View>
                            <Text className="text-white font-bold text-sm">{calcSets(lastWorkout)}</Text>
                            <Text className="text-gray-500 text-[10px] font-bold uppercase">Sets</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        onPress={() => router.push({ pathname: '/workout-details/[id]', params: { id: lastWorkout._id } })}
                        className="flex-row items-center gap-1"
                    >
                        <Text className="text-primary text-xs font-bold uppercase tracking-widest">Details</Text>
                        <MaterialIcons name="chevron-right" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                </View>
            </View>
        ) : (
            <View className="bg-card-dark rounded-3xl p-8 border border-white/5 mb-6 items-center">
                <Text className="text-gray-500">No workout history yet.</Text>
            </View>
        )}

        {/* Stats Grid - Keeping static for now as requested, or hide? 
           User asked "real data on dashboard". Stats like streak require more logic.
           I'll hide these for now or leave them as placeholders if logic isn't ready.
           I will leave them as placeholders but maybe remove specific numbers to avoid confusion.
        */}
        
        {/* Recent History List */}
        <Text className="text-white text-lg font-black mb-4 px-2">Recent Sessions</Text>

        {history.slice(0, 5).map((session, idx) => (
             <TouchableOpacity 
                key={session._id} 
                onPress={() => router.push({ pathname: '/workout-details/[id]', params: { id: session._id } })}
                className="flex-row items-center justify-between p-4 bg-field-dark rounded-2xl mb-3 border border-white/5 active:bg-white/5"
            >
                <View className="flex-row items-center gap-4">
                     <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                        <Text className="text-primary font-bold text-xs">{new Date(session.startedAt).getDate()}</Text>
                     </View>
                     <View>
                         <Text className="text-white font-bold capitalize">{session.type || 'Workout'}</Text>
                         <Text className="text-gray-500 text-xs">{new Date(session.startedAt).toLocaleDateString()}</Text>
                     </View>
                </View>
                <View className="items-end">
                     <Text className="text-white font-medium">{session.exercises?.length || 0} Ex</Text>
                     <Text className="text-gray-500 text-xs">{calcVolume(session) > 0 ? (calcVolume(session)/1000).toFixed(1) + 'k kg' : '-'}</Text>
                </View>
            </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Floating Resume Strip (Active Order Style) */}
      {activeWorkoutId && (
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/workout-session', params: { workoutId: activeWorkoutId } })}
            className="absolute left-4 right-4 bg-primary rounded-xl p-4 flex-row items-center justify-between shadow-2xl shadow-primary/50 border border-white/10"
            style={{ bottom: 100 }} // Just above tab bar
          >
              <View className="flex-row items-center gap-3">
                  <View className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <View>
                      <Text className="text-white font-black text-sm uppercase tracking-wide">Workout In Progress</Text>
                      <Text className="text-white/80 text-xs font-medium">Tap to resume logging sets</Text>
                  </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

