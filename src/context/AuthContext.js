import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../configs/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { STATIC_WORDS } from "../assets/STATIC_WORDS";

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const createUser = async (email, password) => {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        console.log(userCredential.user);
        setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            status: 'active',
            role: 'user',
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        });
        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };
    const signIn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userData = await getDoc(doc(db, STATIC_WORDS.USERS + "/" + currentUser.uid)).then(
                    (data) => {
                        return currentUser && data.exists("status") && data.exists('role') ? data.data() : null;
                    }
                );
                if (userData) {
                    if (userData.status === 'deleted') {
                        setUser(null);
                    } else {
                        const role = userData.role;
                        setUser({ currentUser, role });
                    }

                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ createUser, user, logout, signIn }}>
            {children}
        </UserContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(UserContext);
};
