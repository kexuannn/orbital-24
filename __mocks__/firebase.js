// __mocks__/firebase.js
export const auth = {
    currentUser: null,
  };
  
  export const signInWithEmailAndPassword = jest.fn(() => Promise.resolve({}));
  