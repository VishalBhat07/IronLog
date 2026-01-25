import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { workoutApi } from '@/services/api';

export default function AddExerciseScreen() {
    const router = useRouter();
    const { workoutId } = useLocalSearchParams();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

    // Hardcoded List based on your HTML + extras
    // In a real app, this would come from an API: GET /exercises
    const exercises = [
        {
            category: 'Chest',
            items: [
                { name: 'Incline Dumbbell Press', target: 'Upper Chest' },
                { name: 'Barbell Bench Press', target: 'Middle Chest' },
                { name: 'Chest Fly', target: 'Inner Chest' },
            ]
        },
        {
            category: 'Back',
            items: [
                { name: 'Pull Ups', target: 'Lats, Upper Back' },
                { name: 'Bent Over Row', target: 'Mid Back' },
                { name: 'Lat Pulldown', target: 'Lats' },
            ]
        },
        {
            category: 'Legs',
            items: [
                { name: 'Barbell Squat', target: 'Quads, Glutes' },
                { name: 'Romanian Deadlift', target: 'Hamstrings' },
                { name: 'Leg Extension', target: 'Quads' },
                { name: 'Calf Raises', target: 'Calves' },
            ]
        },
        {
            category: 'Shoulders',
            items: [
                { name: 'Overhead Press', target: 'Front Delts' },
                { name: 'Lateral Raise', target: 'Side Delts' },
            ]
        }
    ];

    const handleAddExercise = async (name: string, target: string) => {
        if (!workoutId) {
             // Maybe logging from dashboard without active session? 
             // For now assume active session.
             return;
        }
        try {
            const result = await workoutApi.addExercise(workoutId as string, name, target);
            if (result.success) {
                router.back();
            }
        } catch (error) {
            console.error('Error adding exercise', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-charcoal" edges={['top', 'left', 'right']}>
            <StatusBar style="light" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-2">
                <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 items-center justify-center">
                    <MaterialIcons name="arrow-back-ios" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Add Exercise</Text>
                <TouchableOpacity className="w-12 h-12 items-center justify-center">
                    <MaterialIcons name="filter-list" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-3">
                <View className="flex-row items-center bg-[#1e2632] border border-[#282e39] h-12 rounded-xl px-4 focus:border-primary">
                    <MaterialIcons name="search" size={20} color="#9da6b9" />
                    <TextInput 
                        className="flex-1 ml-3 text-white text-base"
                        placeholder="Search exercises..."
                        placeholderTextColor="#9da6b9"
                    />
                </View>
            </View>

            {/* Category Chips */}
            <View className="pb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                    {categories.map((cat) => (
                        <TouchableOpacity 
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`h-9 px-5 rounded-full items-center justify-center border ${selectedCategory === cat ? 'bg-primary border-primary' : 'bg-[#1e2632] border-[#282e39]'}`}
                        >
                            <Text className={`text-sm font-medium ${selectedCategory === cat ? 'text-white' : 'text-[#9da6b9]'}`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Exercise List */}
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {exercises.map((group) => {
                    if (selectedCategory !== 'All' && selectedCategory !== group.category) return null;

                    return (
                        <View key={group.category} className="mt-2">
                            <Text className="text-[#9da6b9] text-xs font-bold uppercase tracking-widest px-4 pb-2 pt-4">
                                {group.category}
                            </Text>
                            {group.items.map((item, idx) => (
                                <TouchableOpacity 
                                    key={idx}
                                    onPress={() => handleAddExercise(item.name, item.target)}
                                    className="flex-row items-center justify-between px-4 py-3 border-b border-[#1e2632] active:bg-[#1e2632]"
                                >
                                    <View className="flex-row items-center gap-4">
                                        <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
                                            <MaterialIcons name="fitness-center" size={24} color="#3b82f6" />
                                        </View>
                                        <View>
                                            <Text className="text-white text-base font-semibold">{item.name}</Text>
                                            <Text className="text-[#9da6b9] text-sm">{item.target}</Text>
                                        </View>
                                    </View>
                                    <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                                        <MaterialIcons name="add" size={24} color="#3b82f6" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Bottom Create Button */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-charcoal/90 border-t border-white/5">
                <TouchableOpacity className="w-full h-14 bg-primary rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95">
                    <MaterialIcons name="edit-square" size={20} color="white" />
                    <Text className="text-white text-base font-bold">Create Custom Exercise</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
