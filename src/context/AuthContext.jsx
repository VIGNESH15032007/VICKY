import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  loading: true,
  isConfigured: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  getRedirectPath: () => '/passenger',
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Could not fetch user profile from public.profiles:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Error querying public.profiles:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isConfigured) {
          setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error fetching session:', error.message);
        }

        if (session?.user && mounted) {
          setUser(session.user);
          const profileData = await fetchUserProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
            const resolvedRole = profileData?.role || session.user.user_metadata?.role || 'passenger';
            setRole(resolvedRole);
          }
        }
      } catch (err) {
        console.warn('Error in auth initialization:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        const profileData = await fetchUserProfile(session.user.id);
        if (mounted) {
          setProfile(profileData);
          const resolvedRole = profileData?.role || session.user.user_metadata?.role || 'passenger';
          setRole(resolvedRole);
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [isConfigured]);

  const login = async (email, password) => {
    if (!isConfigured) {
      throw new Error(
        'Supabase is not configured yet. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw error;
    }

    setUser(data.user);

    // Fetch user role from public.profiles table
    const profileData = await fetchUserProfile(data.user.id);
    setProfile(profileData);

    const resolvedRole = profileData?.role || data.user.user_metadata?.role || 'passenger';
    setRole(resolvedRole);

    return {
      user: data.user,
      profile: profileData,
      role: resolvedRole,
      redirectPath: getRedirectPath(resolvedRole),
    };
  };

  const register = async ({ email, password, fullName, phone }) => {
    if (!isConfigured) {
      throw new Error(
        'Supabase is not configured yet. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: 'passenger', // Commuters register as passenger
        },
      },
    });

    if (error) {
      throw error;
    }

    // Attempt to upsert initial profile in public.profiles table if user exists
    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          role: 'passenger',
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn('Could not automatically upsert into public.profiles:', profileErr);
      }
    }

    return data;
  };

  const logout = async () => {
    try {
      if (isConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error during logout:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setRole(null);
    }
  };

  const getRedirectPath = (targetRole) => {
    switch (targetRole?.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'driver':
        return '/driver';
      case 'passenger':
      default:
        return '/passenger';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isConfigured,
        login,
        register,
        logout,
        getRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
