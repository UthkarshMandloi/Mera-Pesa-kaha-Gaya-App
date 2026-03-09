// src/database/queries.ts
import { db } from './schema';

export const getTags = async () => {
  try {
    return await db.getAllAsync('SELECT * FROM tags');
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
};

export const addTransaction = async (
  amount: number, type: string, paymentMode: string, tagId: number | null, note: string, date: string
) => {
  try {
    await db.runAsync(
      'INSERT INTO transactions (amount, type, payment_mode, tag_id, note, date) VALUES (?, ?, ?, ?, ?, ?)',
      [amount, type, paymentMode, tagId, note, date]
    );
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

export const getTransactions = async () => {
  try {
    const data = await db.getAllAsync('SELECT * FROM transactions ORDER BY date DESC');
    console.log("Fetched transactions:", data.length); // <-- This will tell us if it found your money!
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export const deleteTransaction = async (id: number) => {
  try {
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

export const updateTransaction = async (id: number, tagId: number | null, note: string, date: string) => {
  try {
    await db.runAsync(
      'UPDATE transactions SET tag_id = ?, note = ?, date = ? WHERE id = ?',
      [tagId, note, date, id]
    );
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

export const getSetting = async (key: string) => {
  try {
    const result = await db.getFirstAsync<{value: string}>('SELECT value FROM settings WHERE key = ?', [key]);
    return result?.value || null;
  } catch (error) {
    console.error("Error fetching setting:", error);
    return null;
  }
};

export const setSetting = async (key: string, value: string) => {
  try {
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  } catch (error) {
    console.error("Error saving setting:", error);
    throw error;
  }
};