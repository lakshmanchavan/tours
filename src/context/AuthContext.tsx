import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { BUSINESS_INFO } from '../lib/constants';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  toggleAdminMode: () => void; // Development convenience toggle to preview admin features
  isAdminOverride: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdminOverride, setIsAdminOverride] = useState<boolean>(() => {
    return localStorage.getItem('advik_admin_override') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          
          const isOwnerEmail = currentUser.email?.toLowerCase() === BUSINESS_INFO.adminEmail.toLowerCase();
          
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            let needsUpdate = false;
            const updates: Partial<UserProfile> = {};

            if (isOwnerEmail && data.role !== 'admin') {
              updates.role = 'admin';
              data.role = 'admin';
              needsUpdate = true;
            }
            if (currentUser.photoURL && !data.photoURL) {
              updates.photoURL = currentUser.photoURL;
              data.photoURL = currentUser.photoURL;
              needsUpdate = true;
            }

            if (needsUpdate) {
              await setDoc(userDocRef, updates, { merge: true });
            }
            setProfile(data);
          } else {
            // Create user document in Firestore isolated by currentUser.uid
            const isGoogle = currentUser.providerData.some(p => p.providerId === 'google.com');
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Customer',
              phone: currentUser.phoneNumber || '',
              photoURL: currentUser.photoURL || '',
              role: isOwnerEmail ? 'admin' : 'customer',
              authProvider: isGoogle ? 'google' : 'password',
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('Could not read user profile from firestore:', err);
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Customer',
            role: currentUser.email?.toLowerCase() === BUSINESS_INFO.adminEmail.toLowerCase() ? 'admin' : 'customer',
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    
    const isOwnerEmail = email.toLowerCase() === BUSINESS_INFO.adminEmail.toLowerCase();
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName: name,
      phone: phone || '',
      role: isOwnerEmail ? 'admin' : 'customer',
      authProvider: 'password',
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    } catch (e) {
      console.warn('User profile creation warning:', e);
    }
    setProfile(newProfile);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;
    if (googleUser) {
      const userDocRef = doc(db, 'users', googleUser.uid);
      const isOwnerEmail = googleUser.email?.toLowerCase() === BUSINESS_INFO.adminEmail.toLowerCase();
      const existing = await getDoc(userDocRef);
      if (!existing.exists()) {
        const newProfile: UserProfile = {
          uid: googleUser.uid,
          email: googleUser.email || '',
          displayName: googleUser.displayName || 'Customer',
          phone: googleUser.phoneNumber || '',
          photoURL: googleUser.photoURL || '',
          role: isOwnerEmail ? 'admin' : 'customer',
          authProvider: 'google',
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
      }
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const toggleAdminMode = () => {
    setIsAdminOverride(prev => {
      const next = !prev;
      localStorage.setItem('advik_admin_override', String(next));
      return next;
    });
  };

  const isAdmin = 
    profile?.role === 'admin' || 
    user?.email?.toLowerCase() === BUSINESS_INFO.adminEmail.toLowerCase() ||
    isAdminOverride;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      updateUserProfile,
      toggleAdminMode,
      isAdminOverride,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
