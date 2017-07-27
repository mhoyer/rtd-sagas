export type ApiFetchUserResponse = { username: string };

// THE fake API - has nothing to do with redux at all
export default class Api {
  static fetchUser(userId: number) {
    console.log(`API@${userId}: fetchUser triggered for ${userId}`);

    return new Promise<ApiFetchUserResponse>((resolve, reject) => {
      const timer = setInterval(() => console.log(`API@${userId}: waiting`), 200);
      setTimeout(() => {
        clearInterval(timer);

        if (userId === 42) {
          console.log(`API@${userId}: fetchUser resulted in an error`);
          reject(new Error(`user not found :-(`));
        }

        console.log(`API@${userId}: fetchUser got response`);
        resolve({ username: 'b.simpson' });
      }, 1000);
    });
  }
}
