import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, SHADOWS } from '../../styles/theme';
import { Search, BookOpen, ChevronRight, ArrowLeft, HelpCircle } from 'lucide-react-native';

const KnowledgeBaseScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async (query = '') => {
    setLoading(true);
    try {
      let rpcCall;
      if (query.trim()) {
        // If query is present, we could use RPC but for simplicity let's do a text match first
        // If your Supabase has match_articles RPC, use that for vector search
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(10);
        
        if (error) throw error;
        setArticles(data || []);
      } else {
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .limit(20);
        
        if (error) {
          if (error.code === 'PGRST205') {
            console.warn('Knowledge base table not found in Supabase. Showing empty state.');
            setArticles([]);
            return;
          }
          throw error;
        }
        setArticles(data || []);
      }
    } catch (e) {
      console.error('KB Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderArticle = ({ item }) => (
    <TouchableOpacity 
      style={styles.articleCard}
      onPress={() => {/* Show article detail modal or screen */}}
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search for solutions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchArticles(searchQuery)}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={renderArticle}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <HelpCircle size={48} color={COLORS.textMuted} strokeWidth={1} />
              <Text style={styles.emptyText}>No articles found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  searchSection: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, paddingHorizontal: 16, height: 56,
    ...SHADOWS.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)'
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600', color: COLORS.text },
  list: { padding: 20, paddingBottom: 100 },
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 100, gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '600' }
});

export default KnowledgeBaseScreen;
