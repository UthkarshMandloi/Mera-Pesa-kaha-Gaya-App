import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../constants/colors';
import CustomButton from '../../components/CustomButton';
import { getTransactions, deleteTransaction, updateTransaction, getTags } from '../../database/queries';

const HomeScreen = () => {
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [totals, setTotals] = useState({ balance: 0, cash: 0, bank: 0 });

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editTagId, setEditTagId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editTxnType, setEditTxnType] = useState(''); 
  const [dateMode, setDateMode] = useState<'date' | 'time'>('date');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    const fetchedTags = await getTags();
    setTags(fetchedTags);

    const data = await getTransactions();

    let balance = 0, cash = 0, bank = 0;
    const monthsObj: Record<string, any> = {};
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    data.forEach((txn: any) => {
      const amount = Number(txn.amount);
      const isCash = txn.payment_mode === 'cash';
      
      if (txn.type === 'income' || txn.type === 'ghar_se_mila') {
        balance += amount;
        if (isCash) cash += amount; else bank += amount;
      } else if (txn.type === 'expense') {
        balance -= amount;
        if (isCash) cash -= amount; else bank -= amount;
      }

      const d = new Date(txn.date);
      const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`; 

      if (!monthsObj[monthKey]) {
        monthsObj[monthKey] = { monthString: monthKey, transactions: [], totalExpense: 0, totalIncome: 0 };
      }

      monthsObj[monthKey].transactions.push(txn);

      if (txn.type === 'expense') {
        monthsObj[monthKey].totalExpense += amount;
      } else if (txn.type === 'income') {
        monthsObj[monthKey].totalIncome += amount;
      }
    });

    setTotals({ balance, cash, bank });
    setGroupedData(Object.values(monthsObj)); 
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteTransaction(id);
          fetchData(); 
      }}
    ]);
  };

  const openEditModal = (txn: any) => {
    setEditId(txn.id);
    setEditNote(txn.note || '');
    setEditTagId(txn.tag_id);
    setEditDate(new Date(txn.date));
    setEditTxnType(txn.type);
    setIsEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      await updateTransaction(editId, editTagId, editNote, editDate.toISOString());
      setIsEditModalVisible(false);
      fetchData(); 
    } catch (error) {
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) setEditDate(selectedDate);
  };

  const getTagName = (id: number) => tags.find(t => t.id === id)?.name || '';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
          <Text style={styles.cardLabel}>Total Balance</Text>
          <Text style={styles.mainAmount}>₹{totals.balance}</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.halfCard, { backgroundColor: colors.cash }]}>
            <Text style={styles.cardLabel}>Cash</Text>
            <Text style={styles.subAmount}>₹{totals.cash}</Text>
          </View>
          <View style={[styles.halfCard, { backgroundColor: colors.bank }]}>
            <Text style={styles.cardLabel}>Bank / UPI</Text>
            <Text style={styles.subAmount}>₹{totals.bank}</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Transaction History</Text>
        
        {groupedData.length === 0 && <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>No entries found.</Text>}

        {groupedData.map((monthGroup, index) => (
          <View key={index} style={styles.monthSection}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>{monthGroup.monthString}</Text>
              <View style={styles.monthStats}>
                <Text style={styles.statIncome}>Income: ₹{monthGroup.totalIncome}</Text>
                <Text style={styles.statExpense}>Spent: ₹{monthGroup.totalExpense}</Text>
              </View>
            </View>

            {monthGroup.transactions.map((txn: any) => (
              <View key={txn.id} style={styles.txnCard}>
                <View style={styles.txnHeader}>
                  <View>
                    <Text style={styles.txnType}>
                      {txn.type === 'ghar_se_mila' ? 'Ghar Se Mila' : txn.type === 'income' ? 'Income' : 'Expense'}
                    </Text>
                    <Text style={styles.txnDate}>{new Date(txn.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
                  </View>
                  <Text style={[styles.txnAmount, { color: txn.type === 'expense' ? colors.danger : colors.success }]}>
                    {txn.type === 'expense' ? '-' : '+'}₹{txn.amount}
                  </Text>
                </View>

                {txn.tag_id ? <Text style={styles.txnCategory}>Category: {getTagName(txn.tag_id)}</Text> : null}
                {txn.note ? <Text style={styles.txnNote}>"{txn.note}"</Text> : null}

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(txn)}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(txn.id)}>
                    <Text style={{ color: colors.danger, fontWeight: 'bold' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Entry</Text>

            <Text style={styles.sectionTitle}>Date & Time</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
              <TouchableOpacity style={styles.modalDateBtn} onPress={() => { setDateMode('date'); setShowDatePicker(true); }}>
                <Text>{editDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDateBtn} onPress={() => { setDateMode('time'); setShowDatePicker(true); }}>
                <Text>{editDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            </View>

            {editTxnType === 'expense' && (
              <>
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.tagsContainer}>
                  {tags.map((tag) => (
                    <TouchableOpacity 
                      key={tag.id}
                      style={[styles.tagBadge, editTagId === tag.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                      onPress={() => setEditTagId(tag.id)}
                    >
                      <Text style={[styles.tagText, editTagId === tag.id && { color: '#FFF' }]}>{tag.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Note</Text>
            <TextInput style={styles.modalInput} value={editNote} onChangeText={setEditNote} placeholder="Add or change note" />

            <View style={styles.modalActions}>
              <CustomButton title="Cancel" type="danger" onPress={() => setIsEditModalVisible(false)} style={{ flex: 1, marginRight: 5 }} />
              <CustomButton title="Save Changes" type="success" onPress={saveEdit} style={{ flex: 1, marginLeft: 5 }} />
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker && <DateTimePicker value={editDate} mode={dateMode} display="default" onChange={onDateChange} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  card: { padding: 20, borderRadius: 12, marginBottom: 15, elevation: 3 },
  halfCard: { flex: 1, padding: 20, borderRadius: 12, marginBottom: 15, elevation: 3 },
  row: { flexDirection: 'row', gap: 15 },
  cardLabel: { fontSize: 14, color: '#FFF', fontWeight: '600', marginBottom: 5, opacity: 0.9 },
  mainAmount: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  subAmount: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginVertical: 15 },
  monthSection: { marginBottom: 25 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#CCC', paddingBottom: 5 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  monthStats: { alignItems: 'flex-end' },
  statIncome: { fontSize: 12, color: colors.success, fontWeight: 'bold' },
  statExpense: { fontSize: 12, color: colors.danger, fontWeight: 'bold' },
  txnCard: { backgroundColor: colors.surface, padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  txnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txnType: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  txnDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  txnAmount: { fontSize: 18, fontWeight: 'bold' },
  txnCategory: { fontSize: 13, color: colors.primary, marginTop: 8, fontWeight: '500' },
  txnNote: { fontSize: 14, color: colors.textSecondary, marginTop: 5, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10, gap: 15 },
  actionBtn: { padding: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.surface, width: '100%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: colors.textPrimary },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 8, marginTop: 10 },
  modalDateBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, alignItems: 'center' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#CCC' },
  tagText: { fontSize: 13, color: colors.textPrimary },
  modalInput: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' }
});

export default HomeScreen;