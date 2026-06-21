import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { nom, email, message } = await request.json();

  if (!nom || !email || !message) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: 'contact@menmatarlmatar.ma',
    to: 'contact@menmatarlmatar.ma',
    replyTo: email,
    subject: `Nouveau message de ${nom}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #0d5c3a; margin-bottom: 24px;">Nouveau message de contact</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #555; font-weight: bold; width: 80px;">Nom</td>
            <td style="padding: 10px 0; color: #111;">${nom}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #555; font-weight: bold;">Email</td>
            <td style="padding: 10px 0; color: #111;"><a href="mailto:${email}" style="color: #0d5c3a;">${email}</a></td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #555; font-weight: bold; margin-bottom: 8px;">Message</p>
        <p style="color: #111; white-space: pre-wrap; line-height: 1.6;">${message}</p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: 'Échec de l\'envoi' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
