
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from "@/components/ui/use-toast";

// This is a placeholder - after Supabase integration, this will be replaced
// with the actual Supabase client
const supabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async (credentials: { email: string, password: string }) => {
      return { data: { user: null, session: null }, error: new Error('Supabase integration required') };
    },
    signOut: async () => {
      return { error: null };
    }
  }
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error getting initial auth session:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to get authentication session",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
      
      setUser(data.user);
      setSession(data.session);
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back to Media Indoor Pro",
      });
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: "Login failed",
        description: "Please verify your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of Media Indoor Pro",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Logout failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
