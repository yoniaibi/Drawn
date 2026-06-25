import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/lib/supabase';
import { useAuthStore } from '../../../src/store';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';

interface QAItem {
  id: string;
  draw_id: string;
  user_id: string;
  handle: string;
  body: string;
  is_seller_reply: boolean;
  parent_id: string | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DrawQAScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();
  const { user, handle, isLoggedIn } = useAuthStore();

  const [items, setItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerUserId, setSellerUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<QAItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const isSeller = !!user && user.id === sellerUserId;

  useEffect(() => {
    if (!drawId) return;
    fetchInitial();

    const channel = supabase
      .channel(`draw_qa_${drawId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'draw_qa',
          filter: `draw_id=eq.${drawId}`,
        },
        (payload: any) => {
          setItems((prev) => [...prev, payload.new as QAItem]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [drawId]);

  async function fetchInitial() {
    setLoading(true);

    const { data: drawData } = await supabase
      .from('draws')
      .select('seller_id')
      .eq('id', drawId)
      .single();

    if (drawData?.seller_id) {
      setSellerUserId(drawData.seller_id);
    }

    const { data: qaData } = await supabase
      .from('draw_qa')
      .select('*')
      .eq('draw_id', drawId)
      .order('created_at', { ascending: true });

    if (qaData) {
      setItems(qaData as QAItem[]);
    }

    setLoading(false);
  }

  async function handleSubmit() {
    if (!inputText.trim() || !user || submitting) return;

    setSubmitting(true);
    await supabase.from('draw_qa').insert({
      draw_id: drawId,
      user_id: user.id,
      handle,
      body: inputText.trim(),
      is_seller_reply: isSeller && !!replyingTo,
      parent_id: replyingTo?.id ?? null,
    });

    setInputText('');
    setReplyingTo(null);
    setSubmitting(false);
  }

  const topLevelItems = items.filter((i) => i.parent_id === null);

  function getReplies(parentId: string) {
    return items.filter((i) => i.parent_id === parentId);
  }

  function renderQuestion({ item }: { item: QAItem }) {
    const replies = getReplies(item.id);

    return (
      <View style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.qaHandle}>{item.handle}</Text>
          <Text style={styles.qaTime}>{timeAgo(item.created_at)}</Text>
        </View>
        <Text style={styles.qaBody}>{item.body}</Text>

        {replies.map((reply) => (
          <View key={reply.id} style={styles.replyContainer}>
            <View style={styles.replyLine} />
            <View style={styles.replyContent}>
              <View style={styles.replyHeader}>
                <Text style={styles.qaHandle}>{reply.handle}</Text>
                {reply.is_seller_reply && (
                  <View style={styles.sellerBadge}>
                    <Text style={styles.sellerBadgeText}>SELLER</Text>
                  </View>
                )}
                <Text style={styles.qaTime}>{timeAgo(reply.created_at)}</Text>
              </View>
              <Text style={styles.qaBody}>{reply.body}</Text>
            </View>
          </View>
        ))}

        {isSeller && (
          <TouchableOpacity
            style={styles.replyBtn}
            onPress={() => setReplyingTo(item)}
          >
            <Ionicons
              name="return-down-forward-outline"
              size={13}
              color={Colors.lilac}
            />
            <Text style={styles.replyBtnText}>Reply as seller</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderEmpty() {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="chatbubble-outline"
          size={44}
          color={Colors.textSecondary}
        />
        <Text style={styles.emptyTitle}>No questions yet</Text>
        <Text style={styles.emptySub}>
          Be the first to ask the seller something.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Q&amp;A</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.lilac} size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={topLevelItems}
          keyExtractor={(item) => item.id}
          renderItem={renderQuestion}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            topLevelItems.length === 0 && styles.listContentEmpty,
          ]}
          onContentSizeChange={() =>
            topLevelItems.length > 0 &&
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {replyingTo && (
        <View style={styles.replyingBanner}>
          <Text style={styles.replyingText} numberOfLines={1}>
            Replying to: {replyingTo.body}
          </Text>
          <Pressable onPress={() => setReplyingTo(null)}>
            <Ionicons name="close" size={16} color={Colors.textSecondary} />
          </Pressable>
        </View>
      )}

      {isLoggedIn ? (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              isSeller && replyingTo
                ? 'Write a reply…'
                : 'Ask the seller a question…'
            }
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || submitting) && styles.sendBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!inputText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.darkBg} />
            ) : (
              <Ionicons name="send" size={16} color={Colors.darkBg} />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>
            Log in to ask a question
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.loginBtnText}>Log in</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  questionCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  qaHandle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.lilac,
  },
  qaTime: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  qaBody: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  replyLine: {
    width: 2,
    backgroundColor: Colors.darkBorder,
    borderRadius: 1,
    marginRight: Spacing.sm,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  sellerBadge: {
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sellerBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.lilac,
    letterSpacing: 0.6,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  replyBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.lilac,
    fontWeight: '600',
  },
  replyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.darkCard,
    borderTopWidth: 1,
    borderTopColor: Colors.darkBorder,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  replyingText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.darkBorder,
    backgroundColor: Colors.darkBg,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.darkBorder,
    backgroundColor: Colors.darkBg,
  },
  loginPromptText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  loginBtn: {
    backgroundColor: Colors.lilac,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  loginBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
});
