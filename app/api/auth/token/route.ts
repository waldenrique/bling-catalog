import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    // Autenticação conforme documentação do Bling
    const clientId = process.env.BLING_CLIENT_ID;
    const clientSecret = process.env.BLING_CLIENT_SECRET;
    
    // Basic auth usando base64(client_id:client_secret)
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log('Iniciando troca de código por token');

    // Montando o corpo da requisição conforme documentação
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code
    });

    const response = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      },
      body: tokenRequestBody.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to get token from Bling');
    }

    const data = await response.json();

    // Salvar tokens em cookies seguros
    const response_with_cookies = NextResponse.json({ success: true });
    response_with_cookies.cookies.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.expires_in,
    });

    response_with_cookies.cookies.set('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 dias
    });

    return response_with_cookies;
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
