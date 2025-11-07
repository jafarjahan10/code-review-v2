'use server';

import { signOut } from './auth';

export async function signOutFn() {
    await signOut();
}
