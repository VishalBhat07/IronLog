import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function ProgressScreen() {
    return (
        <SafeAreaView className="flex-1 bg-charcoal items-center justify-center p-6">
            <StatusBar style="light" />
            
            <View className="w-24 h-24 bg-field-dark rounded-full items-center justify-center mb-6 shadow-lg shadow-black/20 border border-white/5">
                <MaterialIcons name="insights" size={48} color="#3b82f6" />
            </View>
            
            <Text className="text-white text-3xl font-black tracking-tight text-center mb-2">
                Progress
            </Text>
            <Text className="text-primary text-lg font-bold tracking-widest uppercase mb-6">
                Coming Soon
            </Text>
            
            <Text className="text-gray-500 text-center leading-relaxed px-4">
                We're building powerful analytics to track your gains. 
                Detailed charts and insights will be available in the next update.
            </Text>

            {/* Background Decoration */}
            <View className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent -z-10" />
        </SafeAreaView>
    );
}
