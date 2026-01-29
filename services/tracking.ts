
import { supabase } from './supabase';
import { BookResource } from '../types';

// --- HELPER: AUTO-HEAL USER ---
// Fixes the issue where a logged-in user doesn't exist in public.users table
const ensureUserRecordExists = async (userId: string) => {
    console.log(`🔧 Attempting to self-heal user record for ${userId}...`);
    
    // 1. Get current session data to fill the record
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || session.user.id !== userId) {
        console.error("Cannot heal: Session mismatch or no session.");
        return;
    }

    // 2. Try to insert the missing user record
    const { error } = await supabase.from('users').insert({
        id: userId,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || 'Scientist',
        role: 'SCIENTIST',
        updated_at: new Date().toISOString()
    });

    if (error) {
        // If error is "duplicate key", it means user exists, so we are good. 
        // If other error, we log it.
        if (error.code !== '23505') { 
            console.error("❌ Self-heal failed:", error);
        } else {
            console.log("✅ User record already existed (race condition solved).");
        }
    } else {
        console.log("✅ User record created successfully via self-heal.");
    }
};

// --- HYDRATION ---

export const getTodayHydration = async (userId: string): Promise<number> => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('hydration_logs')
        .select('amount_ml')
        .eq('user_id', userId)
        .eq('date', today);
    
    if (error) {
        console.error('❌ Error fetching hydration:', error);
        return 0;
    }
    
    return data?.reduce((acc, log) => acc + log.amount_ml, 0) || 0;
};

export const logHydration = async (userId: string, amount: number): Promise<{ error: any }> => {
    const today = new Date().toISOString().split('T')[0];
    
    // Try 1: Normal Insert
    let { error } = await supabase
        .from('hydration_logs')
        .insert({
            user_id: userId,
            date: today,
            amount_ml: amount
        });

    // Handle Missing User (FK Violation)
    if (error && error.code === '23503') { 
        await ensureUserRecordExists(userId);
        // Try 2: Retry Insert
        const retry = await supabase.from('hydration_logs').insert({
            user_id: userId,
            date: today,
            amount_ml: amount
        });
        error = retry.error;
    }

    if (error) console.error('❌ Error logging hydration:', error);
    return { error };
};

// --- LIBRARY ---

export const getUserLibrary = async (userId: string): Promise<BookResource[]> => {
    const { data, error } = await supabase
        .from('user_library')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('❌ Error fetching library:', error);
        return [];
    }

    return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        author: row.author,
        category: row.category || 'Focus',
        summary: 'Saved to library', 
        coverUrl: row.cover_url,
        status: row.status as any,
        progress: row.progress || 0,
        isUserAdded: true,
        buyLink: null
    }));
};

export const syncBookStatus = async (userId: string, book: BookResource): Promise<{ error: any }> => {
    // 1. Try to find existing book by title AND user_id
    const { data: existing, error: fetchError } = await supabase
        .from('user_library')
        .select('id')
        .eq('user_id', userId)
        .eq('title', book.title)
        .limit(1);

    if (fetchError) return { error: fetchError };

    let error = null;
    const payload = existing && existing.length > 0
        ? { // Update
            status: book.status,
            progress: book.progress,
            updated_at: new Date().toISOString()
          }
        : { // Insert
            user_id: userId,
            title: book.title,
            author: book.author,
            category: book.category,
            cover_url: book.coverUrl,
            status: book.status,
            progress: book.progress
          };

    if (existing && existing.length > 0) {
        const res = await supabase.from('user_library').update(payload).eq('id', existing[0].id);
        error = res.error;
    } else {
        let res = await supabase.from('user_library').insert(payload);
        
        // Auto-heal check for Library
        if (res.error && res.error.code === '23503') {
            await ensureUserRecordExists(userId);
            res = await supabase.from('user_library').insert(payload);
        }
        error = res.error;
    }

    if (error) console.error('❌ Error syncing book:', error);
    return { error };
};

// --- CHALLENGES ---

export const getUserChallenges = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', userId);
        
    if (error) {
        console.error("❌ Error fetching user challenges:", error);
        return [];
    }
    return data.map((r: any) => r.challenge_id);
};

export const joinChallenge = async (userId: string, challengeId: string): Promise<{ error: any }> => {
    let { error } = await supabase
        .from('user_challenges')
        .insert({
            user_id: userId,
            challenge_id: challengeId,
            status: 'active',
            progress: 0
        });

    // Auto-heal check for Challenges
    if (error && error.code === '23503') {
        // Could be missing User OR missing Challenge ID
        // Try fixing user first
        await ensureUserRecordExists(userId);
        
        const retry = await supabase.from('user_challenges').insert({
            user_id: userId,
            challenge_id: challengeId,
            status: 'active',
            progress: 0
        });
        error = retry.error;
        
        if (error && error.code === '23503') {
             console.warn('⚠️ Challenge ID not found in DB. Need to seed challenges.');
        }
    }

    return { error };
};

export const leaveChallenge = async (userId: string, challengeId: string): Promise<{ error: any }> => {
    const { error } = await supabase
        .from('user_challenges')
        .delete()
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);
    
    if (error) console.error('❌ Error leaving challenge:', error);
    return { error };
};
