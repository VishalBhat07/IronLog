import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function WorkoutScreen() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState('Strength');
    const workoutTypes = ['Strength', 'Cardio', 'Mixed', 'Recovery'];

    return (
        <SafeAreaView className="flex-1 bg-charcoal">
            <StatusBar style="light" />
            
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
                <Text className="text-white text-2xl font-black tracking-tight">Start Workout</Text>
                <TouchableOpacity>
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
                <TouchableOpacity className="mt-8 p-5 bg-primary/5 border border-primary/10 rounded-2xl flex-row items-center gap-4">
                    <View className="bg-primary/20 p-2 rounded-lg">
                        <MaterialIcons name="history" size={24} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-sm font-bold">Previous Routine</Text>
                        <Text className="text-gray-500 text-xs">Last session: Push Day A (3 days ago)</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#4b5563" />
                </TouchableOpacity>

            </ScrollView>

            {/* Fixed Bottom Action */}
            <View className="absolute left-0 right-0 p-6 bg-charcoal/90 border-t border-white/5" style={{ bottom: 80, paddingBottom: 20 }}>
                 <TouchableOpacity 
                    onPress={() => router.push('/workout-session')}
                    className="w-full bg-primary h-16 rounded-2xl items-center justify-center shadow-lg shadow-primary/30 active:scale-[0.98]"
                >
                    <Text className="text-white font-black text-lg uppercase tracking-widest">Start Session</Text>
                </TouchableOpacity>
            </View>


        </SafeAreaView>
    );
}
