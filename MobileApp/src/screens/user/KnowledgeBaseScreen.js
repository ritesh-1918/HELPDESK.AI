import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, StatusBar, Alert, Modal,
  ScrollView, Image, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import { 
  Search, BookOpen, ChevronRight, ArrowLeft, 
  HelpCircle, Video, Play, X, ExternalLink 
} from 'lucide-react-native';
import { YOUTUBE_RESOURCES, VIDEO_CATEGORIES } from '../../data/youtubeResources';

const DEFAULT_ARTICLES = [
  {
    id: 'fallback-kb-1',
    title: 'Self-Service Corporate Password Reset',
    content: 'To reset your corporate Windows and Active Directory passwords, navigate to reset.helpdesk.ai on any company-authorized device. Ensure your backup MFA mobile app is active before initializing the reset sequence. Passwords must be 12+ characters, contain special symbols, and not reuse your last 5 historical entries.'
  },
  {
    id: 'fallback-kb-2',
    title: 'Omnichannel Email & Calendar Setup',
    content: 'Configure Outlook/Gmail on your device by using IMAP/SMTP endpoints. SMTP server: mail.helpdesk.ai (port 587, STARTTLS). IMAP server: mail.helpdesk.ai (port 993, SSL/TLS). Authenticate using your global company credentials and input the OTP generated on your authenticator app.'
  },
  {
    id: 'fallback-kb-3',
    title: 'Enabling MFA & Security Hardware keys',
    content: 'Security rules mandate Multi-Factor Authentication (MFA) for standard logins. Log in to your user profile settings page, select Security tab, and tap "Setup MFA". You can scan the QR code using Google Authenticator, Duo Mobile, or map your hardware YubiKey. Keep backup codes stored safely.'
  },
  {
    id: 'fallback-kb-4',
    title: 'Fixing Local Database Connection Pool Exhaustion',
    content: 'If your FastAPI server fails with "QueuePool limit of size 5 overflow 10 reached", navigate to database settings in your docker-compose config and adjust the `pool_size` parameter to 20, and `max_overflow` to 10. Ensure all session connections are properly closed using ContextManagers.'
  }
];

const KnowledgeBaseScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom enhanced states
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'videos'
  const [activeVideoCategory, setActiveVideoCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Debounced real-time articles search
  useEffect(() => {
    if (activeTab === 'articles') {
      const delayDebounce = setTimeout(() => {
        fetchArticles(searchQuery);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery, activeTab]);

  const fetchArticles = async (query = '') => {
    setLoading(true);
    try {
      let remoteArticles = [];
      const trimmedQuery = query.trim().toLowerCase();

      try {
        if (trimmedQuery) {
          const { data, error } = await supabase
            .from('knowledge_base')
            .select('*')
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .limit(10);
          
          if (!error && data) {
            remoteArticles = data;
          }
        } else {
          const { data, error } = await supabase
            .from('knowledge_base')
            .select('*')
            .limit(20);
          
          if (!error && data) {
            remoteArticles = data;
          }
        }
      } catch (err) {
        console.warn('Supabase knowledge_base query failed, using offline fallbacks.', err);
      }

      // Filter fallbacks locally based on search query
      const localFiltered = trimmedQuery
        ? DEFAULT_ARTICLES.filter(
            art =>
              art.title.toLowerCase().includes(trimmedQuery) ||
              art.content.toLowerCase().includes(trimmedQuery)
          )
        : DEFAULT_ARTICLES;

      // Merge remote and local filtered, ensuring unique titles
      const merged = [...remoteArticles];
      localFiltered.forEach(localArt => {
        if (!merged.some(m => m.title.toLowerCase() === localArt.title.toLowerCase())) {
          merged.push(localArt);
        }
      });

      setArticles(merged);
    } catch (e) {
      console.error('KB Fetch Error:', e);
      setArticles(DEFAULT_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  const handleArticlePress = (item) => {
    setSelectedArticle(item);
    setModalVisible(true);
  };

  const handleVideoPress = (video) => {
    Linking.openURL(video.url).catch(err => {
      Alert.alert("Error", "Could not open YouTube link on your device.");
    });
  };

  // Filter video guides locally in real-time
  const getFilteredVideos = () => {
    let filtered = YOUTUBE_RESOURCES;
    
    if (activeVideoCategory !== 'All') {
      filtered = filtered.filter(v => v.category === activeVideoCategory);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.description.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  };

  const renderArticle = ({ item }) => (
    <TouchableOpacity 
      style={styles.articleCard}
      onPress={() => handleArticlePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.articleIcon}>
        <BookOpen size={20} color={COLORS.primary} />
      </View>
      <View style={styles.articleInfo}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text style={styles.articleSnippet} numberOfLines={2}>{item.content}</Text>
      </View>
      <ChevronRight size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  const renderVideo = ({ item }) => {
    const videoId = item.url.split('v=')[1] || item.id;
    const thumbnailUrl = item.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    return (
      <TouchableOpacity 
        style={styles.videoCard}
        onPress={() => handleVideoPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.thumbnailWrapper}>
          <Image 
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.playOverlay}>
            <View style={styles.playIconContainer}>
              <Play size={20} color="#ffffff" fill="#ffffff" />
            </View>
          </View>
          <View style={styles.videoCategoryBadge}>
            <Text style={styles.videoCategoryText}>{item.category.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.videoContent}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.videoDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.videoActionLink}>
            <ExternalLink size={12} color={COLORS.primary} />
            <Text style={styles.videoActionText}>Watch Guide on YouTube</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
      </View>

      {/* Glassmorphic Tabs Selection */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'articles' && styles.activeTabButton]}
          onPress={() => setActiveTab('articles')}
        >
          <BookOpen size={16} color={activeTab === 'articles' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'articles' && styles.activeTabText]}>Solution Articles</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'videos' && styles.activeTabButton]}
          onPress={() => setActiveTab('videos')}
        >
          <Video size={16} color={activeTab === 'videos' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>Video Guides</Text>
        </TouchableOpacity>
      </View>

      {/* Video Categories Selection Filter */}
      {activeTab === 'videos' && (
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {VIDEO_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryBtn, activeVideoCategory === category && styles.activeCategoryBtn]}
                onPress={() => setActiveVideoCategory(category)}
              >
                <Text style={[styles.categoryBtnText, activeVideoCategory === category && styles.activeCategoryBtnText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder={activeTab === 'articles' ? "Search for solutions..." : "Search video guides..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Solutions / Guides List */}
      {activeTab === 'articles' ? (
        loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={articles}
            keyExtractor={(item) => item.id}
            renderItem={renderArticle}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <HelpCircle size={48} color={COLORS.textMuted} strokeWidth={1} />
                <Text style={styles.emptyText}>No articles found.</Text>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={getFilteredVideos()}
          keyExtractor={(item) => item.id}
          renderItem={renderVideo}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <HelpCircle size={48} color={COLORS.textMuted} strokeWidth={1} />
              <Text style={styles.emptyText}>No video guides found.</Text>
            </View>
          }
        />
      )}

      {/* Premium Bottom Modal Solution Viewer */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalDismissArea} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)} 
          />
          <View style={styles.modalContentCard}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <View style={styles.modalCategoryBadge}>
                <BookOpen size={12} color="#16a34a" />
                <Text style={styles.modalCategoryText}>Solution Article</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color={COLORS.textLight} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalTitle}>{selectedArticle?.title}</Text>
              <Text style={styles.modalBody}>{selectedArticle?.content}</Text>
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalActionBtn}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalActionText}>Got it, Thanks!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  
  // Custom segment control style
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: '#ffffff',
    ...SHADOWS.soft,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.text,
  },

  // Category horizontal filter style
  categoriesWrapper: {
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    ...SHADOWS.soft,
  },
  activeCategoryBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  activeCategoryBtnText: {
    color: '#ffffff',
  },

  searchSection: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, paddingHorizontal: 16, height: 56,
    ...SHADOWS.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)'
  },
  input: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: COLORS.text },
  clearSearchBtn: { padding: 4 },
  list: { padding: 20, paddingBottom: 120 },
  articleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 20, marginBottom: 12,
    ...SHADOWS.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)'
  },
  articleIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginRight: 16
  },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  articleSnippet: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  
  // Custom video cards style
  videoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...SHADOWS.soft,
  },
  thumbnailWrapper: {
    height: 180,
    position: 'relative',
    backgroundColor: '#000000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  playOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    shadowColor: COLORS.primary,
  },
  videoCategoryBadge: {
    position: 'absolute',
    left: 16,
    top: 16,
    backgroundColor: 'rgba(15, 31, 18, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  videoCategoryText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.0,
  },
  videoContent: {
    padding: 16,
    gap: 6,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 20,
  },
  videoDesc: {
    fontSize: 12.5,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  videoActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  videoActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 100, gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },

  // Bottom modal viewer styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 17, 32, 0.65)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContentCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '75%',
    ...SHADOWS.medium,
  },
  modalIndicator: {
    width: 48,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  modalCategoryText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 28,
  },
  modalBody: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 24,
    fontWeight: '500',
  },
  modalActionBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    ...SHADOWS.soft,
  },
  modalActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default KnowledgeBaseScreen;
