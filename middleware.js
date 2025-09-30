import { NextResponse } from 'next/server';

export function middleware(request) {
  const isDown = process.env.IS_DOWN === 'true';
  if (!isDown) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow maintenance page and essential/static resources to be served
  const isMaintenance = pathname.startsWith('/maintenance');
  const isApi = pathname.startsWith('/api');
  const isNext = pathname.startsWith('/_next');
  const isStaticAsset =
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/android-chrome-') ||
    pathname.startsWith('/public');

  if (isMaintenance || isApi || isNext || isStaticAsset) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/maintenance';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next).*)'],
};


