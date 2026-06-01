import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../styles/theme';
import { ArrowRight, Sparkles, BrainCircuit, Globe, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const NeuralDiagnosticsIllustration = () => (
  <View style={styles.illContainer}>
    <View style={styles.terminalCard}>
      <View style={styles.terminalHeader}>
        <View style={[styles.terminalDot, { backgroundColor: '#ef4444' }]} />
        <View style={[styles.terminalDot, { backgroundColor: '#eab308' }]} />
        <View style={[styles.terminalDot, { backgroundColor: '#22c55e' }]} />
        <Text style={styles.terminalTitle}>neural_engine.py</Text>
      </View>
      <View style={styles.terminalContent}>
        <Text style={styles.codeText}>
          <Text style={{ color: '#f43f5e' }}>class </Text>
          <Text style={{ color: '#38bdf8' }}>TicketClassifier</Text>
          <Text style={{ color: '#fff' }}>:</Text>
        </Text>
        <Text style={[styles.codeText, { paddingLeft: 12 }]}>
          <Text style={{ color: '#a855f7' }}>predict</Text>
          <Text style={{ color: '#fff' }}>(log) --&gt; </Text>
          <Text style={{ color: '#22c55e' }}>"CRITICAL"</Text>
        </Text>
      </View>
    </View>
    <LinearGradient
      colors={['#10b981', '#059669']}
      style={styles.floatingBadge}
    >
      <BrainCircuit size={16} color="#fff" />
      <Text style={styles.badgeText}>99.8% Match</Text>
    </LinearGradient>
  </View>
);

const OmnichannelIllustration = () => (
  <View style={styles.illContainer}>
    <View style={styles.omniCard}>
      <View style={[styles.speechBubble, styles.bubbleLeft]}>
        <Text style={styles.bubbleText}>Help! My laptop won't boot...</Text>
      </View>
      <View style={[styles.speechBubble, styles.bubbleRight]}>
        <Text style={styles.bubbleText}>Bonjour, VPN déconnecté</Text>
      </View>
      <View style={styles.waveformContainer}>
        <View style={[styles.waveBar, { height: 16 }]} />
        <View style={[styles.waveBar, { height: 32 }]} />
        <View style={[styles.waveBar, { height: 48, backgroundColor: '#3b82f6' }]} />
        <View style={[styles.waveBar, { height: 24 }]} />
        <View style={[styles.waveBar, { height: 36 }]} />
      </View>
    </View>
  </View>
);

const RapidResolutionIllustration = () => (
  <View style={styles.illContainer}>
    <View style={styles.gaugeCard}>
      <LinearGradient
        colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.02)']}
        style={styles.gaugeCircle}
      >
        <Zap size={32} color="#f59e0b" />
        <Text style={styles.gaugeVal}>0.4s</Text>
        <Text style={styles.gaugeLbl}>Auto-Triage</Text>
      </LinearGradient>
      <View style={styles.checkBadge}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      </View>
    </View>
  </View>
);

const SLIDES = [
  {
    id: '1',
    title: 'AI Neural Diagnostics',
    description: 'Instant IT ticket triage and categorization using state-of-the-art neural models.',
    illustration: <NeuralDiagnosticsIllustration />,
    color: '#10b981'
  },
  {
    id: '2',
    title: 'Omnichannel Input',
    description: 'Report issues using Voice, Screenshots, or Text in over 50+ languages.',
    illustration: <OmnichannelIllustration />,
    color: '#3b82f6'
  },
  {
    id: '3',
    title: 'Rapid Resolution',
    description: 'Auto-resolution matching and rapid response times for mission-critical operations.',
    illustration: <RapidResolutionIllustration />,
    color: '#f59e0b'
  }
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await AsyncStorage.setItem('@onboarding_complete', 'true');
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleStart();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.iconWrapper}>
        {item.illustration}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0f172a', '#020617']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/logo_v1.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <Text style={styles.logoText}>HELPDESK<Text style={{ color: COLORS.primary }}>.AI</Text></Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          keyExtractor={(item) => item.id}
        />

        <View style={styles.footer}>
          <View style={styles.indicatorContainer}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [10, 25, 10],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i}
                  style={[styles.dot, { width: dotWidth, opacity, backgroundColor: i === currentIndex ? COLORS.primary : 'rgba(255,255,255,0.3)' }]}
                />
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={styles.btnText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ArrowRight size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 20,
    gap: 12
  },
  logo: { width: 40, height: 40, borderRadius: 10 },
  logoText: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconWrapper: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1,
  },
  description: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  footer: { 
    paddingHorizontal: 32, 
    paddingBottom: 40,
    gap: 30
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  primaryBtn: {
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    ...SHADOWS.large,
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  illContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  terminalCard: {
    width: 190,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    borderWidth: 1.5,
    borderColor: '#334155',
    padding: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 6,
  },
  terminalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  terminalTitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'System',
    marginLeft: 4,
    fontWeight: '600',
  },
  terminalContent: {
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'System',
    lineHeight: 18,
    fontWeight: '600',
  },
  floatingBadge: {
    position: 'absolute',
    bottom: 25,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  omniCard: {
    width: 200,
    height: 180,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1.5,
    borderColor: '#334155',
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  speechBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  bubbleLeft: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: '#475569',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#64748b',
    borderRadius: 2,
  },
  gaugeCard: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gaugeCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#f59e0b',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  gaugeVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginTop: 4,
  },
  gaugeLbl: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#10b981',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0f172a',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  checkCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default OnboardingScreen;
