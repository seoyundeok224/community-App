import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';

type DiaryEntry = { id: string; date: string; text: string; createdAt: number };

const dateToKey = (d: Date) => d.toISOString().split('T')[0];
const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDay = (y: number, m: number) => new Date(y, m, 1).getDay();

const THEME = {
  primary: '#2563eb',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  weekendBg: '#fff7ed',
  weekendText: '#c2410c',
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
};

export default function DiaryScreen() {
  const today = useMemo(() => dateToKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [yearMonth, setYearMonth] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });

  const [diaryText, setDiaryText] = useState('');
  const [entries, setEntries] = useState<Record<string, DiaryEntry[]>>({});
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);
  const inputRef = useRef<TextInput | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 날짜 전환 애니메이션
  const fadeAnim = useState(new Animated.Value(1))[0];
  const animateMonth = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  // Load
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('@diary');
      if (raw) setEntries(JSON.parse(raw));
    })();
  }, []);

  // Save
  useEffect(() => {
    AsyncStorage.setItem('@diary', JSON.stringify(entries));
  }, [entries]);

  // 날짜 바뀌면 입력창 초기화
  useEffect(() => {
    setDiaryText('');
  }, [selectedDate]);

  // 키보드 이벤트
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const addEntry = () => {
    const text = diaryText.trim();
    if (!text) return;
    const id = uuid.v4().toString();
    const createdAt = Date.now();

    setEntries((prev) => {
      const list = prev[selectedDate] ? [...prev[selectedDate]] : [];
      list.push({ id, date: selectedDate, text, createdAt });
      return { ...prev, [selectedDate]: list };
    });
    setDiaryText('');
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const list = prev[selectedDate].filter((e) => e.id !== id);
      const next = { ...prev };
      if (list.length === 0) delete next[selectedDate];
      else next[selectedDate] = list;
      return next;
    });
  };

  const startEdit = (item: DiaryEntry) => {
    setEditing({ id: item.id, text: item.text });
    setShowModal(true);
  };

  const saveEdit = () => {
    if (!editing || !editing.text.trim()) return;
    const newTxt = editing.text.trim();
    setEntries((prev) => {
      const list = prev[selectedDate].map((e) =>
        e.id === editing.id ? { ...e, text: newTxt } : e
      );
      return { ...prev, [selectedDate]: list };
    });
    setEditing(null);
    setShowModal(false);
  };

  const goToday = () => {
    const t = dateToKey(new Date());
    setSelectedDate(t);
    const n = new Date();
    setYearMonth({ year: n.getFullYear(), month: n.getMonth() });
    animateMonth();
  };

  const changeMonth = (delta: number) => {
    setYearMonth((prev) => {
      const newDate = new Date(prev.year, prev.month + delta, 1);
      animateMonth();
      return { year: newDate.getFullYear(), month: newDate.getMonth() };
    });
  };

  const list = (selectedDate ? (entries[selectedDate] || []) : []).slice().sort((a, b) => b.createdAt - a.createdAt);

  const calendarGrid = useMemo(() => {
    const { year, month } = yearMonth;
    const first = getFirstDay(year, month);
    const days = getDaysInMonth(year, month);
    const cells: Array<{ type: 'empty' } | { type: 'day'; day: number; key: string }> = [];

    for (let i = 0; i < first; i++) cells.push({ type: 'empty' });
    for (let d = 1; d <= days; d++)
      cells.push({ type: 'day', day: d, key: `${year}-${month + 1}-${d}` });

    return cells;
  }, [yearMonth]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: keyboardHeight + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => changeMonth(-1)}>
            <Text style={styles.iconBtnText}>{'‹'}</Text>
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              {yearMonth.year}년 {yearMonth.month + 1}월
            </Text>
            <Text style={styles.subtitle}>{new Date(yearMonth.year, yearMonth.month, 1).toLocaleString('ko-KR', { month: 'long' })}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.todayBtn} onPress={goToday}>
              <Text style={styles.todayBtnText}>오늘</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => changeMonth(1)}>
              <Text style={styles.iconBtnText}>{'›'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Week header */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.weekHeader}>
            {['일', '월', '화', '수', '목', '금', '토'].map((w) => (
              <Text key={w} style={styles.weekText}>{w}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarGrid.map((cell, idx) => {
              if (cell.type === 'empty') return <View key={`e-${idx}`} style={styles.dayCellEmpty} />;
              const dateKey = dateToKey(new Date(yearMonth.year, yearMonth.month, cell.day));
              const isSel = dateKey === selectedDate;
              const isTod = dateKey === today;
              const hasNote = entries[dateKey]?.length > 0;
              const first = getFirstDay(yearMonth.year, yearMonth.month);
              const wk = (cell.day - 1 + first) % 7;
              const weekend = wk === 0 || wk === 6;

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={[styles.dayCell, weekend && styles.weekendCell]}
                  onPress={() => {
                    if (selectedDate === dateKey) {
                      setSelectedDate('');
                      inputRef.current?.blur();
                    } else {
                      setSelectedDate(dateKey);
                      setTimeout(() => inputRef.current?.focus(), 80);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.dayInner, isSel && styles.dayInnerSel]}>
                    <Text style={[styles.dayNumber, isSel && styles.dayNumberSel, weekend && styles.weekendText]}>{cell.day}</Text>
                  </View>
                  {hasNote && !isSel && <View style={styles.dot} />}
                  {isTod && !isSel && <View style={styles.todayRing} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* 입력창 + 추가 버튼 */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 }}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="메모를 입력하세요"
            value={diaryText}
            onChangeText={setDiaryText}
            multiline
          />
          <TouchableOpacity
            disabled={!diaryText.trim()}
            onPress={addEntry}
            style={{ marginLeft: 8, flexShrink: 0 }}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={[styles.input, { 
                paddingHorizontal: 16, 
                justifyContent: 'center', 
                borderRadius: 12, 
                borderWidth: 0, // 테두리 제거
                borderColor: 'transparent',
                minHeight: 60, // 입력창과 동일 높이
              }]}
            >
              <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>추가</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 리스트 */}
        {list.length === 0 ? (
          <Text style={styles.emptyText}>기록 없음</Text>
        ) : (
          list.map((item) => (
            <Pressable key={item.id} onLongPress={() => startEdit(item)} style={styles.entryWrap}>
              <LinearGradient colors={['#ffffff', '#f8fafc']} style={[styles.entryCard, THEME.cardShadow]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryText} numberOfLines={3}>{item.text}</Text>
                  <Text style={styles.tsText}>입력: {new Date(item.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.entryActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(item)}>
                    <Text style={styles.editText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.delBtn} onPress={() => removeEntry(item.id)}>
                    <Text style={styles.delText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* 수정 모달 */}
      <Modal visible={showModal} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>메모 수정</Text>
            <TextInput
              style={styles.modalInput}
              value={editing?.text}
              multiline
              onChangeText={(t) => setEditing((s) => s ? { ...s, text: t } : null)}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setShowModal(false)}>
                <Text>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnSave, !editing?.text.trim() && { opacity: 0.5 }]}
                disabled={!editing?.text.trim()}
                onPress={saveEdit}
              >
                <Text style={{ color: '#fff' }}>저장</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 16, marginTop: Platform.OS === 'ios' ? 40 : 0 },
  headerTitle: { fontWeight: '700', fontSize: 18 },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: '#f8fafc', marginHorizontal: 4 },
  iconBtnText: { fontSize: 18, color: '#111827' },
  titleWrap: { alignItems: 'center' },
  subtitle: { fontSize: 12, color: '#6b7280' },
  todayBtn: { backgroundColor: THEME.primary, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginRight: 8 },
  todayBtnText: { color: '#fff', fontWeight: '700' },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingHorizontal: 2 },
  weekText: { width: '14.2857%', textAlign: 'center', fontWeight: '600' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', position: 'relative', padding: 6 },
  dayCellEmpty: { width: '14.2857%', aspectRatio: 1, padding: 6 },
  weekendCell: { backgroundColor: THEME.weekendBg },
  dayInner: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  dayInnerSel: { backgroundColor: THEME.primary },
  dayNumber: { fontSize: 14, color: '#111827' },
  dayNumberSel: { color: '#fff', fontWeight: '700' },
  weekendText: { color: THEME.weekendText },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.warning, position: 'absolute', bottom: 6 },
  todayRing: { position: 'absolute', width: '80%', height: '80%', borderRadius: 999, borderWidth: 1.5, borderColor: THEME.primary },
  input: { flex: 1, minHeight: 60, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 10, backgroundColor: '#fff' },
  entryCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  entryWrap: { marginBottom: 8 },
  entryActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  editBtn: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8 },
  editText: { color: '#111827' },
  entryText: { fontSize: 15, marginBottom: 6 },
  tsText: { fontSize: 12, color: '#6b7280' },
  delBtn: { backgroundColor: THEME.danger, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  delText: { color: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 10, color: '#6b7280' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '90%', backgroundColor: '#fff', padding: 16, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  modalInput: { minHeight: 120, borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 10, marginBottom: 14, textAlignVertical: 'top' },
  modalRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#f3f4f6', borderRadius: 8, marginLeft: 8 },
  modalBtnSave: { backgroundColor: THEME.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
});
