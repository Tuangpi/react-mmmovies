import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../configs/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

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
            let role = null;
            if (currentUser) {
                role = await getDoc(doc(db, "users/" + currentUser.uid)).then(
                    (data) => {
                        return currentUser && data.exists("role") ? data.data().role : null;
                    }
                );
                setUser({ currentUser, role });
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
