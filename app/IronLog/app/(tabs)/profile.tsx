import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
    const { signOut, user } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-charcoal items-center justify-center">
            <Text className="text-white text-2xl font-bold">Profile</Text>
            <Text className="text-gray-400 mt-2 mb-8">Logged in as {user?.name || 'User'}</Text>
            
            <TouchableOpacity 
                onPress={signOut}
                className="bg-red-500 px-6 py-3 rounded-xl"
            >
                <Text className="text-white font-bold">Log Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
