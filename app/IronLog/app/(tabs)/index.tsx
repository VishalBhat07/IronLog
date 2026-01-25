import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView className="flex-1 bg-charcoal">
       <StatusBar style="light" />
      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
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

        {/* Today's Workout Card */}
        <View className="bg-card-dark rounded-3xl p-6 border border-white/5 relative overflow-hidden mb-6">
             <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider">Today's Workout</Text>
                    <Text className="text-white text-xl font-bold mt-1">Leg Day Focus</Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <Text className="text-primary text-[10px] font-black uppercase tracking-widest">Not Started</Text>
                </View>
            </View>

            <View className="flex-row gap-4 mb-8">
                <View className="flex-1 bg-black/40 rounded-2xl p-3 border border-white/5">
                    <Text className="text-gray-500 text-[10px] font-bold uppercase">Estimated</Text>
                    <Text className="text-white font-bold">65 min</Text>
                </View>
                <View className="flex-1 bg-black/40 rounded-2xl p-3 border border-white/5">
                    <Text className="text-gray-500 text-[10px] font-bold uppercase">Exercises</Text>
                    <Text className="text-white font-bold">7 Move</Text>
                </View>
            </View>

            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push('/workout')}
                className="w-full bg-primary h-14 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
                <MaterialIcons name="play-arrow" size={24} color="white" />
                <Text className="text-white font-black text-lg uppercase tracking-wider">Start Workout</Text>
            </TouchableOpacity>

        </View>

        {/* Last Workout Card */}
        <View className="bg-card-dark rounded-3xl p-6 border border-white/5 mb-6">
            <View className="flex-row items-center gap-3 mb-6">
                <View className="bg-accent-orange/10 p-2 rounded-xl border border-accent-orange/20">
                    <MaterialIcons name="history" size={20} color="#f97316" />
                </View>
                <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider">Last Workout</Text>
            </View>

            <View className="flex-row justify-between items-end">
                <View>
                    <Text className="text-white text-2xl font-black mb-1">Push Day</Text>
                    <Text className="text-gray-500 text-xs font-medium">Saturday, May 20</Text>
                </View>
                <View className="items-end">
                    <View className="flex-row items-baseline gap-1">
                        <Text className="text-white text-xl font-black">5,420</Text>
                        <Text className="text-gray-500 text-xs font-bold">kg</Text>
                    </View>
                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Volume</Text>
                </View>
            </View>

            <View className="mt-6 pt-6 border-t border-white/5 flex-row justify-between items-center">
                <View className="flex-row gap-4">
                    <View>
                        <Text className="text-white font-bold text-sm">8</Text>
                        <Text className="text-gray-500 text-[10px] font-bold uppercase">Moves</Text>
                    </View>
                    <View>
                        <Text className="text-white font-bold text-sm">24</Text>
                        <Text className="text-gray-500 text-[10px] font-bold uppercase">Sets</Text>
                    </View>
                </View>
                <TouchableOpacity className="flex-row items-center gap-1">
                    <Text className="text-primary text-xs font-bold uppercase tracking-widest">Details</Text>
                    <MaterialIcons name="chevron-right" size={16} color="#3b82f6" />
                </TouchableOpacity>
            </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-4">
            <View className="flex-1 bg-card-dark rounded-3xl p-5 border border-white/5">
                <MaterialIcons name="local-fire-department" size={24} color="#3b82f6" style={{ marginBottom: 12 }} />
                <Text className="text-white text-xl font-black">12 Day</Text>
                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Streak</Text>
            </View>
            <View className="flex-1 bg-card-dark rounded-3xl p-5 border border-white/5">
                <MaterialIcons name="trending-up" size={24} color="#f97316" style={{ marginBottom: 12 }} />
                <Text className="text-white text-xl font-black">+4.2%</Text>
                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Strength</Text>
            </View>
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

