import { NextResponse } from 'next/server';
import { sendSelectiveProcessReminders } from '@/lib/cron/actions';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await sendSelectiveProcessReminders();

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
