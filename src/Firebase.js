/* import firebase from 'firebase/compat/app';
import 'firebase//compat/firestore';*/
//import { getStorage } from "firebase/storage";

import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBIQMQEsOfJNio7J_yqWiw0GfB3L82IdPM",
  authDomain: "placement-management-44bbf.firebaseapp.com",
  projectId: "placement-management-44bbf",
  storageBucket: "placement-management-44bbf.appspot.com",
  messagingSenderId: "871035678645",
  appId: "1:871035678645:web:1c48ef902dc906f6a7f3fc",
  measurementId: "G-2TK9DHXZES"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const batch = firebase.firestore().batch();
const auth = firebaseApp.auth();
//const storage = getStorage(firebaseApp);
const storage = firebase.storage();


export { db, auth, storage, batch};

/* const firebaseApp = firebase.initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);
const db=firebase.firestore();
export {firebaseApp,db,storage}; */
