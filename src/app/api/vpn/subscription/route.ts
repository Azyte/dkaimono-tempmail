import { NextRequest, NextResponse } from 'next/server';
import { generateBase64Subscription, generateClashYamlConfig, generateFastProxyNodes } from '@/lib/proxyNodeGenerator';

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') || 'base64';

  if (format === 'clash' || format === 'yaml') {
    return new NextResponse(generateClashYamlConfig(), {
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Content-Disposition': 'inline; filename="dkaimono_clash_nodes.yaml"',
      },
    });
  }

  if (format === 'json') {
    return NextResponse.json({
      success: true,
      nodes: generateFastProxyNodes(),
    });
  }

  // Default: Base64 raw subscription
  return new NextResponse(generateBase64Subscription(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'inline; filename="subscription.txt"',
    },
  });
}
