import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Item = { id: string; title: string; description?: string; imageUri?: string };
type Comment = { id: string; text: string; createdAt: number; itemId: string };

export default function HomeScreen() {
  
  const [items, setItems] = useState<Item[]>([
  ]);
  const [newItem, setNewItem] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    if (editingItemId) {
      setItems(s => s.map(i => (i.id === editingItemId ? { ...i, title: newItem.trim(), imageUri: imageUri ?? i.imageUri } : i)));
      setEditingItemId(null);
      setNewItem('');
      setImageUri(null);
      return;
    }
    const it: Item = { id: String(Date.now()), title: newItem.trim(), imageUri: imageUri ?? undefined };
    setItems(s => [it, ...s]);
    setNewItem('');
    setImageUri(null);
  };

  const startEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setNewItem(item.title);
    setImageUri(item.imageUri ?? null);
  };

  const cancelEditItem = () => {
    setEditingItemId(null);
    setNewItem('');
    setImageUri(null);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    if (!selectedItemId) return Alert.alert('항목 선택', '댓글을 추가하려면 먼저 항목을 선택하세요.');
    if (editingCommentId) {
      // update existing comment
      setComments(s => s.map(c => (c.id === editingCommentId ? { ...c, text: newComment.trim() } : c)));
      setEditingCommentId(null);
      setNewComment('');
      return;
    }
    const c: Comment = { id: String(Date.now()), text: newComment.trim(), createdAt: Date.now(), itemId: selectedItemId };
    setComments(s => [c, ...s]);
    setNewComment('');
  };

  const startEditComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setNewComment(c.text);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setNewComment('');
  };

  const deleteComment = (id: string) => {
    Alert.alert('삭제 확인', '이 댓글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => setComments(s => s.filter(c => c.id !== id)) },
    ]);
  };

  const deselectItem = () => setSelectedItemId(null);

  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const openViewer = (uri: string) => setViewerUri(uri);
  const closeViewer = () => setViewerUri(null);

  const deleteItem = (id: string) => {
    Alert.alert('삭제 확인', '이 항목을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => setItems(s => s.filter(i => i.id !== id)) },
    ]);
  };

  const pickImage = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('권한 필요', '이미지 첨부를 위해 미디어 권한이 필요합니다.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6, allowsEditing: true, aspect: [4,3] });
      const anyRes = res as any;
      if (!anyRes.canceled) {
        const uri = anyRes.uri ?? anyRes.assets?.[0]?.uri ?? null;
        setImageUri(uri);
      }
    } catch {
      Alert.alert('패키지 필요', '이미지 첨부 기능을 사용하려면 expo-image-picker를 설치하세요.\n`expo install expo-image-picker`');
    }
  };

  

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerHeight={0}>
      <ThemedView style={styles.container}>
        

        <View style={styles.rowInput}>
          <TextInput
            placeholder="새 항목 입력"
            value={newItem}
            onChangeText={setNewItem}
            style={styles.input}
            accessibilityLabel="새 항목 입력"
          />
          {editingItemId ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={addItem} style={styles.addButton} accessibilityRole="button" accessibilityLabel="항목 수정">
                <ThemedText style={{ color: '#fff' }}>수정</ThemedText>
              </TouchableOpacity>
              <Pressable onPress={cancelEditItem} style={{ marginLeft: 8, padding: 8 }} accessibilityRole="button" accessibilityLabel="편집 취소">
                <ThemedText style={{ color: '#666' }}>취소</ThemedText>
              </Pressable>
            </View>
          ) : (
            <TouchableOpacity onPress={addItem} style={styles.addButton} accessibilityRole="button" accessibilityLabel="항목 추가">
              <ThemedText style={{ color: '#fff' }}>추가</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          <ThemedText style={styles.empty}>아직 항목이 없습니다. 새 항목을 추가해보세요.</ThemedText>
        ) : (
          <View style={styles.list}>
            {items.map(item => (
              <View key={item.id} style={{ marginBottom: 6 }}>
                <Pressable onPress={() => (selectedItemId === item.id ? deselectItem() : setSelectedItemId(item.id))} accessibilityRole="button" accessibilityLabel={`항목 선택 ${item.title}`}>
                  <ThemedView style={[styles.item, selectedItemId === item.id ? styles.itemSelected : undefined]}>
                    <View style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                        {item.description ? <ThemedText>{item.description}</ThemedText> : null}
                      </View>
                      {item.imageUri ? (
                        <Pressable onPress={() => openViewer(item.imageUri as string)} accessibilityRole="imagebutton" accessibilityLabel="항목 이미지 보기">
                          <Image source={{ uri: item.imageUri }} style={styles.itemThumb as any} />
                        </Pressable>
                      ) : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Pressable onPress={() => startEditItem(item)} style={{ marginRight: 8, padding: 6 }} accessibilityRole="button" accessibilityLabel="항목 편집">
                          <Ionicons name="pencil" size={18} color="#0a7ea4" />
                        </Pressable>
                        <Pressable onPress={() => deleteItem(item.id)} style={styles.deleteButton} accessibilityRole="button" accessibilityLabel="항목 삭제">
                          <Ionicons name="trash" size={18} color="#c62828" />
                        </Pressable>
                      </View>
                    </View>
                  </ThemedView>
                </Pressable>

                {selectedItemId === item.id && (
                  <View style={styles.inlineCommentContainer}>
                    <View style={styles.rowInput}>
                      <TextInput
                        placeholder={editingCommentId ? '댓글 수정' : '댓글 추가'}
                        value={newComment}
                        onChangeText={setNewComment}
                        style={styles.input}
                        accessibilityLabel="댓글 입력"
                      />
                      {editingCommentId ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Pressable onPress={addComment} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="댓글 수정">
                            <ThemedText style={{ color: '#fff' }}>수정</ThemedText>
                          </Pressable>
                          <Pressable onPress={cancelEdit} style={{ marginLeft: 8, padding: 8 }} accessibilityRole="button" accessibilityLabel="편집 취소">
                            <ThemedText style={{ color: '#666' }}>취소</ThemedText>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable onPress={addComment} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="댓글 등록">
                          <ThemedText style={{ color: '#fff' }}>등록</ThemedText>
                        </Pressable>
                      )}
                    </View>

                    <View style={styles.commentsListInline}>
                      {comments.filter(c => c.itemId === item.id).map(c => (
                        <ThemedView key={c.id} style={styles.commentRow}>
                          <View style={{ flex: 1 }}>
                            <ThemedText>{c.text}</ThemedText>
                            <ThemedText style={styles.smallText}>{new Date(c.createdAt).toLocaleString()}</ThemedText>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Pressable onPress={() => startEditComment(c)} style={{ marginRight: 8, padding: 6 }} accessibilityRole="button" accessibilityLabel="댓글 수정">
                              <Ionicons name="pencil" size={16} color="#0a7ea4" />
                            </Pressable>
                            <Pressable onPress={() => deleteComment(c.id)} style={styles.deleteButton} accessibilityRole="button" accessibilityLabel="댓글 삭제">
                              <Ionicons name="trash" size={16} color="#c62828" />
                            </Pressable>
                          </View>
                        </ThemedView>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <ThemedText type="subtitle">이미지 첨부</ThemedText>
        <View style={{ marginBottom: 12 }}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview as any} /> : null}
          <TouchableOpacity onPress={pickImage} style={styles.addButton} accessibilityRole="button" accessibilityLabel="이미지 첨부">
            <ThemedText style={{ color: '#fff' }}>{imageUri ? '이미지 변경' : '이미지 첨부'}</ThemedText>
          </TouchableOpacity>
        </View>

        <Modal visible={!!viewerUri} transparent animationType="fade" onRequestClose={closeViewer}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Image source={{ uri: viewerUri as string }} style={styles.modalImage as any} />
              <Pressable onPress={closeViewer} style={styles.modalClose} accessibilityRole="button" accessibilityLabel="이미지 닫기">
                <ThemedText style={{ color: '#fff' }}>닫기</ThemedText>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* 댓글 섹션: 이미지 첨부 아래에 있던 전역 댓글 입력 및 리스트를 제거했습니다. */}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  details: { marginBottom: 8, color: '#11181C' },
  rowInput: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' as const },
  input: { flex: 1, borderWidth: 1, borderColor: '#dcdcdc', borderRadius: 8, padding: 10, backgroundColor: '#ffffff' },
  addButton: { backgroundColor: '#0a7ea4', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  list: { marginBottom: 16 },
  item: { padding: 12, borderWidth: 1, borderColor: '#dcdcdc', borderRadius: 8, marginBottom: 8, backgroundColor: '#ffffff' },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemThumb: { width: 72, height: 72, borderRadius: 8, marginLeft: 12 },
  itemSelected: { borderColor: '#0a7ea4', borderWidth: 2 },
  itemImage: { width: '100%', height: 140, marginTop: 8, borderRadius: 8 },
  preview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
  comment: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  deleteButton: { marginLeft: 8, padding: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', maxHeight: '86%', backgroundColor: '#000', borderRadius: 10, padding: 12, alignItems: 'center' },
  modalImage: { width: '100%', height: 420, resizeMode: 'contain', borderRadius: 8, marginBottom: 12 },
  modalClose: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  inlineCommentContainer: { marginTop: 8, padding: 8, backgroundColor: '#fbfbfb', borderRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  commentsListInline: { marginTop: 8 },
  pressed: { opacity: 0.7 },
  smallText: { fontSize: 12, color: '#9ba1a6' },
  commentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  empty: { color: '#9ba1a6', marginBottom: 8 },
  
});
