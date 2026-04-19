const resolvedAuthSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || null;
const resolvedAuthUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || null;

if (!process.env.NEXTAUTH_SECRET && resolvedAuthSecret) {
    process.env.NEXTAUTH_SECRET = resolvedAuthSecret;
}

if (!process.env.NEXTAUTH_URL && resolvedAuthUrl) {
    process.env.NEXTAUTH_URL = resolvedAuthUrl;
}

export const authSecret = resolvedAuthSecret;
export const authUrl = resolvedAuthUrl;
