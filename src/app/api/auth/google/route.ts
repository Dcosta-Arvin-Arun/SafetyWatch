import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { sign } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Handles Google OAuth2 code exchange and user authentication/creation.
 * Accepts an authorization code, exchanges for tokens, verifies ID token, and manages user session.
 */
export async function POST(req: NextRequest) {
  try {
    const { code, isAdminRegister = false } = await req.json();

    if (!code) {
      return NextResponse.json(
        { message: 'Google authorization code is required' },
        { status: 400 }
      );
    }

    const { tokens } = await client.getToken({
      code,
      redirect_uri: 'postmessage',
    });

    if (!tokens || !tokens.id_token) {
      return NextResponse.json(
        { message: 'Failed to retrieve ID token from Google' },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid Google token' },
        { status: 400 }
      );
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email || !name) {
      return NextResponse.json(
        { message: 'Required user information not available from Google' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          displayName: name,
          password: '',
          role: isAdminRegister ? 'admin' : 'user',
        },
      });
    } else {
      // If user exists and isAdminRegister is true, upgrade to admin if not already
      if (isAdminRegister && user.role !== 'admin') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' },
        });
      }
      if (!user.displayName && name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { displayName: name },
        });
      }
    }

    const token = sign(
      { id: user.id, email: user.email, role: user.role, displayName: user.displayName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const res = NextResponse.json({
      user: { uid: user.id, email: user.email, displayName: user.displayName, role: user.role },
    });
    res.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Google authentication failed',
        error: error?.toString(),
      },
      { status: 500 }
    );
  }
}
