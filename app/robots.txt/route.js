export async function GET() {
    const robots = `User-agent: *\nDisallow: /admin/\nDisallow: /api/\nDisallow: /projects/\n`;
    
    return new Response(robots, {
      headers: { "Content-Type": "text/plain" },
    });
  }
  