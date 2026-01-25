import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withDelay, 
    withSequence,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.95);
    const glowOpacity = useSharedValue(0);
    const slideY = useSharedValue(0);
    const contentOpacity = useSharedValue(1);

    useEffect(() => {
        // 1. Fade in Logo & Scale Up
        opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
        scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });

        // 2. Glow Pulse
        glowOpacity.value = withDelay(600, withSequence(
            withTiming(0.6, { duration: 400 }),
            withTiming(0, { duration: 400 })
        ));

        // 3. Slide Up & Reveal
        slideY.value = withDelay(2000, withTiming(-height, { duration: 600, easing: Easing.inOut(Easing.cubic) }, (finished) => {
             if (finished) {
                 runOnJS(onFinish)();
             }
        }));
    }, []);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: slideY.value }]
    }));

    const animatedLogoStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value
    }));

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            {/* Background */}
            <View style={styles.background}>
                <LinearGradient
                    colors={['rgba(59, 130, 246, 0.15)', 'transparent']}
                    style={styles.gradientTopLeft}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                 <LinearGradient
                    colors={['rgba(59, 130, 246, 0.1)', 'transparent']}
                    style={styles.gradientBottomRight}
                    start={{ x: 1, y: 1 }}
                    end={{ x: 0, y: 0 }}
                />
            </View>

            {/* Logo Container */}
            <View style={styles.logoContainer}>
                {/* Glow Effect */}
                <Animated.View style={[styles.glow, animatedGlowStyle]} />
                
                {/* Logo & Text */}
                <Animated.View style={[styles.content, animatedLogoStyle]}>
                     {/* Using the generated image directly */}
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logoImage}
                        contentFit="contain"
                    />
                </Animated.View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0f1115',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // Ensure it sits on top
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    gradientTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width * 0.6,
        height: width * 0.6,
        borderBottomRightRadius: width * 0.6,
    },
    gradientBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: width * 0.5,
        height: width * 0.5,
        borderTopLeftRadius: width * 0.5,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#3b82f6',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
        elevation: 10,
    },
    content: {
        alignItems: 'center',
    },
    logoImage: {
        width: 300,
        height: 300,
    }
});
