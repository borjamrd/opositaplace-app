import { NextResponse } from 'next/server';
import { sendWeeklySummaries } from '@/lib/cron/actions';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('Starting weekly summary job...');
    const result = await sendWeeklySummaries();
    console.log('Weekly summary job finished.');

    return NextResponse.json({
      message: 'Job completed successfully.',
      processed: result.processed,
      failed: result.failed,
    });
  } catch (error: any) {
    console.error('Cron job failed:', error.message);
    return NextResponse.json(
      { message: 'Job execution failed.', error: error.message },
      { status: 500 }
    );
  }
}
