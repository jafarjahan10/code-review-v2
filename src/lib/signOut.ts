'use server';

import { signOut } from './auth';

export async function signOutFn(path: string) {
    await signOut({ redirectTo: path});
}
