import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../constants/colors';
import CustomButton from '../../components/CustomButton';
import { getTags, addTransaction } from '../../database/queries';

const AddExpenseScreen = () => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('expense'); 
  const [paymentMode, setPaymentMode] = useState('upi'); 
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTags();
    }, [])
  );

  const fetchTags = async () => {
    const fetchedTags = await getTags();
    setTags(fetchedTags);
  };

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    if (type === 'expense' && !selectedTag) {
      Alert.alert('Error', 'Please select a category for this expense.');
      return;
    }

    try {
      const finalTagId = (type === 'expense' && selectedTag) ? selectedTag : null;
      await addTransaction(
        Number(amount), 
        type, 
        paymentMode, 
        finalTagId, 
        note, 
        date.toISOString()
      ); // Notice there is no 7th item here anymore!
      
      Alert.alert('Success', 'Entry saved successfully!');
      setAmount('');
      setNote('');
      setSelectedTag(null);
      setDate(new Date()); 
    } catch (error) {
      Alert.alert('Error', 'Could not save transaction.');
    }
  };

  const getPaymentLabel = (pmode: string) => {
    switch(pmode) {
      case 'net_banking': return 'Net Banking';
      case 'upi': return 'UPI';
      case 'card': return 'Card';
      default: return 'Cash';
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) setDate(selectedDate);
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setMode(currentMode);
    setShowDatePicker(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.typeContainer}>
        <TouchableOpacity style={[styles.typeBtn, type === 'expense' && { backgroundColor: colors.danger }]} onPress={() => setType('expense')}>
          <Text style={[styles.toggleText, type === 'expense' && { color: '#FFF' }]}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, type === 'income' && { backgroundColor: colors.success }]} onPress={() => setType('income')}>
          <Text style={[styles.toggleText, type === 'income' && { color: '#FFF' }]}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, type === 'ghar_se_mila' && { backgroundColor: colors.primary }]} onPress={() => setType('ghar_se_mila')}>
          <Text style={[styles.toggleText, type === 'ghar_se_mila' && { color: '#FFF' }]}>Ghar se mila</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Amount (₹)" keyboardType="numeric" value={amount} onChangeText={setAmount} placeholderTextColor={colors.textSecondary} />

      <Text style={styles.sectionTitle}>Date & Time</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <TouchableOpacity style={[styles.dateButton, { flex: 1 }]} onPress={() => showMode('date')}>
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dateButton, { flex: 1 }]} onPress={() => showMode('time')}>
          <Text style={styles.dateText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && <DateTimePicker value={date} mode={mode} display="default" onChange={onChangeDate} maximumDate={new Date()} />}

      <Text style={styles.sectionTitle}>Payment Mode</Text>
      <View style={styles.gridContainer}>
        {['upi', 'cash', 'card', 'net_banking'].map((pmode) => (
          <TouchableOpacity key={pmode} style={[styles.gridBtn, paymentMode === pmode && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setPaymentMode(pmode)}>
            <Text style={[styles.gridText, paymentMode === pmode && { color: '#FFF' }]}>{getPaymentLabel(pmode)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === 'expense' && (
        <>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <TouchableOpacity key={tag.id} style={[styles.tagBadge, selectedTag === tag.id && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setSelectedTag(tag.id)}>
                <Text style={[styles.tagText, selectedTag === tag.id && { color: '#FFF' }]}>{tag.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Add a note (optional)" multiline value={note} onChangeText={setNote} placeholderTextColor={colors.textSecondary} />

      <CustomButton title="Save Entry" type="primary" onPress={handleSave} style={{ marginTop: 10 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, minWidth: '30%', paddingVertical: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, alignItems: 'center', backgroundColor: colors.surface },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 15, fontSize: 16, color: colors.textPrimary, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 10, marginLeft: 5 },
  dateButton: { backgroundColor: colors.surface, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  dateText: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  gridBtn: { flex: 1, minWidth: '45%', paddingVertical: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, alignItems: 'center', backgroundColor: colors.surface },
  gridText: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 8 },
  tagBadge: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#CCC', backgroundColor: colors.surface },
  tagText: { color: colors.textPrimary, fontSize: 14 },
});

export default AddExpenseScreen;